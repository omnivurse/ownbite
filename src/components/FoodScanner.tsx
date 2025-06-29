import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, RefreshCw, Loader2, Save, AlertCircle, Share2 } from 'lucide-react';
import Button from './ui/Button';
import Card, { CardBody, CardFooter } from './ui/Card';
import { scanService } from '../services/scanService';
import { diaryService } from '../services/diaryService';
import SocialShareButton from './social/SocialShareButton';

interface FoodScannerProps {
  onScanComplete?: (results: any) => void;
  className?: string;
}

const FoodScanner: React.FC<FoodScannerProps> = ({ onScanComplete, className = '' }) => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [optimizationProgress, setOptimizationProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to optimize image before analysis
  const optimizeImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setOptimizationProgress('Loading image...');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOptimizationProgress('Resizing image...');
          
          // Create a canvas to resize the image
          const canvas = document.createElement('canvas');
          
          // Calculate new dimensions (max 1024px on longest side)
          const MAX_SIZE = 1024;
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
          
          // Set canvas dimensions and draw resized image
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          setOptimizationProgress('Compressing image...');
          
          // Convert to JPEG with reduced quality
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Calculate size reduction
          const originalSize = file.size;
          const base64Data = optimizedDataUrl.split(',')[1];
          const optimizedSize = Math.round((base64Data.length * 3) / 4);
          const reductionPercent = Math.round(((originalSize - optimizedSize) / originalSize) * 100);
          
          console.log(`Image optimized: ${originalSize} bytes → ${optimizedSize} bytes (${reductionPercent}% reduction)`);
          
          setOptimizationProgress(null);
          resolve(optimizedDataUrl);
        };
        
        img.onerror = () => {
          setOptimizationProgress(null);
          reject(new Error('Failed to load image'));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        setOptimizationProgress(null);
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setImage(file);
    setError('');
    setResults(null);

    try {
      // Optimize the image before setting preview
      const optimizedImageUrl = await optimizeImage(file);
      setImagePreview(optimizedImageUrl);
    } catch (err: any) {
      console.error('Error optimizing image:', err);
      
      // Fallback to standard preview if optimization fails
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Show a warning but don't block the user
      setError('Image optimization failed. Analysis may take longer than usual.');
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const analyzeImage = async () => {
    if (!imagePreview) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const analysisResults = await scanService.analyzeImage(imagePreview);
      setResults(analysisResults);
      onScanComplete?.(analysisResults);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveToDiary = async () => {
    if (!results) return;

    setSaving(true);
    try {
      const entries = results.foodItems.map((item: any) => ({
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        image_url: imagePreview,
        timestamp: new Date().toISOString()
      }));

      await Promise.all(entries.map(entry => diaryService.addFoodEntry(entry)));
      
      // Reset the scanner
      setImage(null);
      setImagePreview(null);
      setResults(null);
      setError('');
      
      // Show success message
      setError('✅ Successfully saved to your food diary!');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error saving to diary:', error);
      setError('Failed to save to diary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setImagePreview(null);
    setResults(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardBody>
          <div
            className={`
              border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors
              ${imagePreview ? 'border-primary-300 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload food image"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              aria-hidden="true"
            />

            {imagePreview ? (
              <div className="space-y-3 sm:space-y-4">
                <img
                  src={imagePreview}
                  alt="Food to analyze"
                  className="max-w-full max-h-48 sm:max-h-64 mx-auto rounded-lg shadow-md"
                />
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:space-x-3">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetScanner();
                    }}
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                    size="sm"
                    className="sm:size-md"
                  >
                    Choose Different Image
                  </Button>
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      analyzeImage();
                    }}
                    disabled={loading}
                    leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    size="sm"
                    className="sm:size-md"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Food'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-neutral-900 mb-1 sm:mb-2">
                    📷 Upload Food Photo
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 mb-2 sm:mb-4">
                    Drag and drop an image here, or click to browse
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    Supported formats: JPG, PNG, WebP (max 10MB)
                  </p>
                </div>
              </div>
            )}
            
            {/* Optimization progress indicator */}
            {optimizationProgress && (
              <div className="mt-3 text-sm text-primary-600">
                <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                {optimizationProgress}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Error Display */}
      {error && (
        <div className={`p-3 sm:p-4 rounded-lg flex items-center space-x-2 ${
          error.includes('✅') 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">{error}</span>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <Card>
          <CardBody>
            <div className="space-y-4 sm:space-y-6">
              {/* Nutrition Summary */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3 sm:mb-4">
                  🍽️ Nutritional Analysis
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <NutritionStat
                    label="Calories"
                    value={`${results.totalCalories}`}
                    unit="kcal"
                    bgColor="bg-primary-100"
                    textColor="text-primary-800"
                  />
                  <NutritionStat
                    label="Protein"
                    value={`${results.totalProtein}`}
                    unit="g"
                    bgColor="bg-blue-100"
                    textColor="text-blue-800"
                  />
                  <NutritionStat
                    label="Carbs"
                    value={`${results.totalCarbs}`}
                    unit="g"
                    bgColor="bg-purple-100"
                    textColor="text-purple-800"
                  />
                  <NutritionStat
                    label="Fat"
                    value={`${results.totalFat}`}
                    unit="g"
                    bgColor="bg-yellow-100"
                    textColor="text-yellow-800"
                  />
                </div>
              </div>

              {/* Individual Food Items */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2 sm:mb-3">
                  🔍 Identified Foods
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  {results.foodItems.map((item: any, index: number) => (
                    <FoodItemCard key={index} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
          
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={resetScanner}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              size="sm"
              className="sm:size-md w-full sm:w-auto"
            >
              Scan Another
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <SocialShareButton
                contentType="food_scan"
                contentId={results.id || "latest"}
                contentName={results.foodItems[0]?.name || "food"}
                imageUrl={imagePreview || undefined}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              />
              <Button
                variant="primary"
                onClick={saveToDiary}
                disabled={saving}
                leftIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                size="sm"
                className="sm:size-md w-full sm:w-auto"
              >
                {saving ? 'Saving...' : 'Save to Diary'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardBody className="text-center py-8 sm:py-12">
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-primary-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-neutral-900 mb-1 sm:mb-2">
              Analyzing Your Food...
            </h3>
            <p className="text-sm sm:text-base text-neutral-600">
              Our AI is identifying ingredients and calculating nutrition facts
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

interface NutritionStatProps {
  label: string;
  value: string;
  unit: string;
  bgColor: string;
  textColor: string;
}

const NutritionStat: React.FC<NutritionStatProps> = ({
  label,
  value,
  unit,
  bgColor,
  textColor
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-3 sm:p-4 text-center`}>
      <div className="text-xs sm:text-sm text-neutral-600 mb-1">{label}</div>
      <div className={`text-lg sm:text-2xl font-bold ${textColor}`}>
        {value}
        <span className="text-xs sm:text-sm font-normal ml-1">{unit}</span>
      </div>
    </div>
  );
};

interface FoodItemCardProps {
  item: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    healthBenefits?: string[];
    healthRisks?: string[];
  };
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item }) => {
  return (
    <div className="p-3 sm:p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <h5 className="font-medium text-sm sm:text-base text-neutral-900 capitalize">{item.name}</h5>
        <span className="text-sm sm:text-base text-primary-600 font-medium">{item.calories} cal</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-600 mb-2 sm:mb-3">
        <div>Protein: <span className="font-medium">{item.protein}g</span></div>
        <div>Carbs: <span className="font-medium">{item.carbs}g</span></div>
        <div>Fat: <span className="font-medium">{item.fat}g</span></div>
      </div>

      {/* Health Benefits and Risks */}
      {(item.healthBenefits?.length || item.healthRisks?.length) && (
        <div className="space-y-1 sm:space-y-2">
          {item.healthBenefits && item.healthBenefits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.healthBenefits.map((benefit, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  ✓ {benefit}
                </span>
              ))}
            </div>
          )}

          {item.healthRisks && item.healthRisks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.healthRisks.map((risk, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  ⚠ {risk}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodScanner;