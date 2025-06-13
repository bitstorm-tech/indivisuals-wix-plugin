import React from 'react';
import { POPULAR_FONTS, PopularFont, TemplateText } from '../../types/template';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

interface TextPropertiesPanelProps {
  text: TemplateText;
  onUpdate: (updates: Partial<TemplateText>) => void;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72];
const TEXT_COLORS = ['#000000', '#333333', '#666666', '#999999', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

export default function TextPropertiesPanel({ text, onUpdate }: TextPropertiesPanelProps) {
  const handleStyleChange = (styleUpdates: Partial<TemplateText['style']>) => {
    onUpdate({
      style: {
        ...text.style,
        ...styleUpdates,
      },
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ content: e.target.value });
  };

  return (
    <Card className="p-4">
      <h4 className="mb-4 font-medium">Text Eigenschaften</h4>

      <div className="space-y-4">
        {/* Text Content */}
        <div className="space-y-2">
          <Label htmlFor="text-content">Text</Label>
          <Input id="text-content" value={text.content} onChange={handleContentChange} placeholder="Text eingeben..." />
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label>Schriftart</Label>
          <Select value={text.style.fontFamily} onValueChange={(value: PopularFont) => handleStyleChange({ fontFamily: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POPULAR_FONTS.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label>Schriftgröße</Label>
          <Select value={text.style.fontSize.toString()} onValueChange={(value) => handleStyleChange({ fontSize: parseInt(value) })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label>Textfarbe</Label>
          <div className="flex flex-wrap gap-2">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                className={`h-8 w-8 rounded border-2 transition-all ${
                  text.style.color === color ? 'scale-110 border-blue-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleStyleChange({ color })}
                title={color}
              />
            ))}
          </div>
          <Input type="color" value={text.style.color} onChange={(e) => handleStyleChange({ color: e.target.value })} className="h-10 w-full" />
        </div>

        {/* Font Weight and Style */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Gewicht</Label>
            <Select value={text.style.fontWeight} onValueChange={(value: 'normal' | 'bold') => handleStyleChange({ fontWeight: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Fett</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Stil</Label>
            <Select value={text.style.fontStyle} onValueChange={(value: 'normal' | 'italic') => handleStyleChange({ fontStyle: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="italic">Kursiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Text Alignment */}
        <div className="space-y-2">
          <Label>Ausrichtung</Label>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={text.style.textAlign === 'left' ? 'default' : 'outline'}
              onClick={() => handleStyleChange({ textAlign: 'left' })}
              className="px-3"
            >
              L
            </Button>
            <Button
              size="sm"
              variant={text.style.textAlign === 'center' ? 'default' : 'outline'}
              onClick={() => handleStyleChange({ textAlign: 'center' })}
              className="px-3"
            >
              M
            </Button>
            <Button
              size="sm"
              variant={text.style.textAlign === 'right' ? 'default' : 'outline'}
              onClick={() => handleStyleChange({ textAlign: 'right' })}
              className="px-3"
            >
              R
            </Button>
          </div>
        </div>

        {/* Position and Size Info */}
        <div className="border-t pt-2">
          <div className="space-y-1 text-sm text-gray-600">
            <div>
              Position: {Math.round(text.position.x)}, {Math.round(text.position.y)}
            </div>
            <div>
              Größe: {Math.round(text.size.width)} × {Math.round(text.size.height)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
