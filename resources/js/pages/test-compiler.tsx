import { useState } from 'react';

export default function TestCompiler() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // This would normally need useCallback
  const increment = () => {
    setCount((c) => c + 1);
  };

  const decrement = () => {
    setCount((c) => c - 1);
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
      <h1 className="mb-8 text-3xl font-bold">React Compiler Test</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Counter Test</h2>
        <p className="mb-2">Count: {count}</p>
        <p className="mb-2">Doubled: {doubled}</p>
        <p className="mb-4">Squared: {squared}</p>

        <div className="flex gap-2">
          <button onClick={increment} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Increment
          </button>
          <button onClick={decrement} className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
            Decrement
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Text Input Test</h2>
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type something..."
          className="mb-2 w-full rounded border px-3 py-2"
        />
        <p>Text length: {textLength}</p>
        <p>Text: {text}</p>
      </div>

      <div className="mt-8 rounded bg-gray-100 p-4">
        <p className="text-sm text-gray-600">
          This component demonstrates React Compiler's automatic optimization. All callbacks and computed values are automatically memoized without
          explicit useCallback or useMemo hooks.
        </p>
      </div>
    </div>
  );
}
