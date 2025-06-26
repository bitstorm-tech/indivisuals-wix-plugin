import AdminSidebar from '@/components/admin/AdminSidebar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { getCsrfToken } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { Code, Loader2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface PromptTesterProps {
  auth: {
    user: User;
  };
}

type Model = 'dall-e-2' | 'gpt-image-1';
type Background = 'auto' | 'transparent' | 'opaque';
type Quality = 'low' | 'medium' | 'high';
type DallE2Size = '256x256' | '512x512' | '1024x1024';
type GptImage1Size = '1024x1024' | '1536x1024' | '1024x1536';

interface OpenAiRequestParams {
  model: string;
  size: string;
  n: number;
  response_format: string;
  masterPrompt: string;
  specificPrompt: string;
  combinedPrompt: string;
  quality?: string;
  background?: string;
}

const DALLE2_SIZES: Record = {
  '256x256': '256x256',
  '512x512': '512x512',
  '1024x1024': '1024x1024',
};

const GPT_IMAGE_1_SIZES: Record = {
  '1024x1024': '1024x1024',
  '1536x1024': '1536x1024 (landscape)',
  '1024x1536': '1024x1536 (portrait)',
};

const MASTER_PROMPT_STORAGE_KEY = 'promptTester.masterPrompt';

export default function PromptTester({ auth }: PromptTesterProps) {
  const [selectedModel, setSelectedModel] = useState<Model>('gpt-image-1');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record>({});
  const [requestParams, setRequestParams] = useState<OpenAiRequestParams | null>(null);

  const { data, setData } = useForm({
    masterPrompt: '',
    specificPrompt: '',
    model: 'gpt-image-1' as Model,
    background: 'auto' as Background,
    quality: 'low' as Quality,
    size: '1024x1024',
  });

  // Load master prompt from localStorage on mount
  useEffect(() => {
    const storedMasterPrompt = localStorage.getItem(MASTER_PROMPT_STORAGE_KEY);
    if (storedMasterPrompt) {
      setData('masterPrompt', storedMasterPrompt);
    }
  }, [setData]);

  // Save master prompt to localStorage whenever it changes
  useEffect(() => {
    if (data.masterPrompt) {
      localStorage.setItem(MASTER_PROMPT_STORAGE_KEY, data.masterPrompt);
    }
  }, [data.masterPrompt]);

  useEffect(() => {
    setData('model', selectedModel);
    if (selectedModel === 'dall-e-2') {
      setData('size', '1024x1024');
    } else {
      setData('size', '1024x1024');
    }
  }, [selectedModel, setData]);

  const handleImageUpload = (e: React.ChangeEvent) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedImage('');
      setError('');
      setValidationErrors({});
      setRequestParams(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedImage) {
      setError('Please upload an image');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedImage('');
    setValidationErrors({});

    const formData = new FormData();
    formData.append('masterPrompt', data.masterPrompt);
    formData.append('specificPrompt', data.specificPrompt);
    formData.append('model', data.model);
    formData.append('background', data.background);
    formData.append('quality', data.quality);
    formData.append('size', data.size);

    if (uploadedImage) {
      formData.append('image', uploadedImage);
    }

    try {
      const response = await fetch('/admin/test-prompt', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': getCsrfToken(),
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
      });

      // Clone the response so we can read it as text if JSON parsing fails
      const responseClone = response.clone();

      let result;
      try {
        result = await response.json();
      } catch {
        // If JSON parsing fails, it's likely an HTML error page
        const text = await responseClone.text();
        if (text.includes('Maximum execution time')) {
          throw new Error('The request timed out. Please try again with simpler settings or a smaller image.');
        }
        throw new Error('Server returned an invalid response. Please check the server logs.');
      }

      if (!response.ok) {
        if (response.status === 422 && result.errors) {
          setValidationErrors(result.errors);
          return;
        }
        throw new Error(result.message || 'Failed to generate image');
      }

      setGeneratedImage(result.imageUrl);
      setRequestParams(result.requestParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSizeOptions = () => {
    return selectedModel === 'dall-e-2' ? DALLE2_SIZES : GPT_IMAGE_1_SIZES;
  };

  return (
    <>
      <Head title="Admin - Prompt Tester" />
      <div className="flex h-screen">
        <AdminSidebar user={auth.user} />
        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="mb-8 text-3xl font-bold">Prompt Tester</h1>

          <form onSubmit={handleSubmit} className="flex max-w-4xl flex-col gap-6">
            <div className="flex flex-wrap gap-8">
              <div>
                <Label htmlFor="model">Model</Label>
                <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as Model)}>
                  <SelectTrigger id="model" className={`mt-1 ${validationErrors.model ? 'border-red-500' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dall-e-2">dall-e-2</SelectItem>
                    <SelectItem value="gpt-image-1">gpt-image-1</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.model && <p className="mt-1 text-sm text-red-600">{validationErrors.model}</p>}
              </div>

              <div>
                <Label htmlFor="background">Background</Label>
                <Select
                  value={data.background}
                  onValueChange={(value) => setData('background', value as Background)}
                  disabled={selectedModel === 'dall-e-2'}
                >
                  <SelectTrigger id="background" className={`mt-1 ${validationErrors.background ? 'border-red-500' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="transparent">Transparent</SelectItem>
                    <SelectItem value="opaque">Opaque</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.background && <p className="mt-1 text-sm text-red-600">{validationErrors.background}</p>}
              </div>

              <div>
                <Label htmlFor="quality">Quality</Label>
                <Select value={data.quality} onValueChange={(value) => setData('quality', value as Quality)} disabled={selectedModel === 'dall-e-2'}>
                  <SelectTrigger id="quality" className={`mt-1 ${validationErrors.quality ? 'border-red-500' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.quality && <p className="mt-1 text-sm text-red-600">{validationErrors.quality}</p>}
              </div>

              <div>
                <Label htmlFor="size">Size</Label>
                <Select value={data.size} onValueChange={(value) => setData('size', value)}>
                  <SelectTrigger id="size" className={`mt-1 ${validationErrors.size ? 'border-red-500' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(getSizeOptions()).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.size && <p className="mt-1 text-sm text-red-600">{validationErrors.size}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="masterPrompt">Master Prompt</Label>
                <Textarea
                  id="masterPrompt"
                  placeholder="Enter master prompt..."
                  value={data.masterPrompt}
                  onChange={(e) => setData('masterPrompt', e.target.value)}
                  className={`mt-1 min-h-[120px] ${validationErrors.masterPrompt ? 'border-red-500' : ''}`}
                />
                {validationErrors.masterPrompt && <p className="mt-1 text-sm text-red-600">{validationErrors.masterPrompt}</p>}
              </div>

              <div>
                <Label htmlFor="specificPrompt">Specific Prompt</Label>
                <Textarea
                  id="specificPrompt"
                  placeholder="Enter specific prompt..."
                  value={data.specificPrompt}
                  onChange={(e) => setData('specificPrompt', e.target.value)}
                  className={`mt-1 min-h-[120px] ${validationErrors.specificPrompt ? 'border-red-500' : ''}`}
                />
                {validationErrors.specificPrompt && <p className="mt-1 text-sm text-red-600">{validationErrors.specificPrompt}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="image">Upload Image</Label>
              <div className="mt-1">
                <label
                  htmlFor="image"
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 hover:border-gray-400 ${
                    validationErrors.image ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-48 rounded" />
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">Click to upload image</span>
                    </>
                  )}
                  <input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {validationErrors.image && <p className="mt-1 text-sm text-red-600">{validationErrors.image}</p>}
              </div>
            </div>

            {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>}

            <Button type="submit" disabled={isGenerating} className="w-full md:w-auto">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
          </form>

          {generatedImage && (
            <div className="mt-8 space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold">Generated Image</h2>
                <img src={generatedImage} alt="Generated" className="max-w-full rounded-lg shadow-lg" />
              </div>

              {requestParams && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      API Request Parameters
                    </CardTitle>
                    <CardDescription>These are the actual parameters sent to the OpenAI API</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="prompts">
                        <AccordionTrigger>Prompts</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Master Prompt</Label>
                              <div className="mt-1 rounded-md bg-gray-50 p-3 text-sm">{requestParams.masterPrompt}</div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Specific Prompt</Label>
                              <div className="mt-1 rounded-md bg-gray-50 p-3 text-sm">{requestParams.specificPrompt}</div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Combined Prompt (Sent to OpenAI API)</Label>
                              <div className="mt-1 rounded-md bg-gray-50 p-3 text-sm">{requestParams.combinedPrompt}</div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="parameters">
                        <AccordionTrigger>Other Parameters</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="font-medium">Model</Label>
                              <p className="mt-1 text-gray-600">{requestParams.model}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Size</Label>
                              <p className="mt-1 text-gray-600">{requestParams.size}</p>
                            </div>
                            {requestParams.quality && (
                              <div>
                                <Label className="font-medium">Quality</Label>
                                <p className="mt-1 text-gray-600">{requestParams.quality}</p>
                              </div>
                            )}
                            {requestParams.background && (
                              <div>
                                <Label className="font-medium">Background</Label>
                                <p className="mt-1 text-gray-600">{requestParams.background}</p>
                              </div>
                            )}
                            <div>
                              <Label className="font-medium">Number of Images</Label>
                              <p className="mt-1 text-gray-600">{requestParams.n}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Response Format</Label>
                              <p className="mt-1 text-gray-600">{requestParams.response_format}</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
