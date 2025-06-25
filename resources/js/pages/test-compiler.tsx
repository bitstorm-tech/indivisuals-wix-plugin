import { useState } from 'react';

export default function TestCompiler() {
    const [count, setCount] = useState(0);
    const [text, setText] = useState('');
    
    // This would normally need useCallback
    const increment = () => {
        setCount(c => c + 1);
    };
    
    const decrement = () => {
        setCount(c => c - 1);
    };
    
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };
    
    // This would normally need useMemo
    const doubled = count * 2;
    const squared = count * count;
    const textLength = text.length;
    
    return (
        <div className="container mx-auto p-8">
                <h1 className="text-3xl font-bold mb-8">React Compiler Test</h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Counter Test</h2>
                    <p className="mb-2">Count: {count}</p>
                    <p className="mb-2">Doubled: {doubled}</p>
                    <p className="mb-4">Squared: {squared}</p>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={increment}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Increment
                        </button>
                        <button 
                            onClick={decrement}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Decrement
                        </button>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Text Input Test</h2>
                    <input
                        type="text"
                        value={text}
                        onChange={handleTextChange}
                        placeholder="Type something..."
                        className="w-full px-3 py-2 border rounded mb-2"
                    />
                    <p>Text length: {textLength}</p>
                    <p>Text: {text}</p>
                </div>
                
                <div className="mt-8 p-4 bg-gray-100 rounded">
                    <p className="text-sm text-gray-600">
                        This component demonstrates React Compiler's automatic optimization.
                        All callbacks and computed values are automatically memoized without
                        explicit useCallback or useMemo hooks.
                    </p>
                </div>
            </div>
    );
}