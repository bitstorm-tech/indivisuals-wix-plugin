import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Prompt {
    id: number;
    name: string;
    category: string;
    prompt: string;
    active: boolean;
}

interface AdminProps {
    prompts: Prompt[];
}

export default function Admin({ prompts }: AdminProps) {
    const [editingPrompts, setEditingPrompts] = useState<Record<number, Prompt>>({});

    const handleEdit = (prompt: Prompt) => {
        setEditingPrompts((prev) => ({
            ...prev,
            [prompt.id]: { ...prompt },
        }));
    };

    const handleCancel = (promptId: number) => {
        setEditingPrompts((prev) => {
            const newState = { ...prev };
            delete newState[promptId];
            return newState;
        });
    };

    const handleSave = async (promptId: number) => {
        const editedPrompt = editingPrompts[promptId];
        if (!editedPrompt) return;

        try {
            await fetch(`/admin/prompts/${promptId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: editedPrompt.name,
                    category: editedPrompt.category,
                    prompt: editedPrompt.prompt,
                }),
            });

            router.reload({ only: ['prompts'] });
            handleCancel(promptId);
        } catch (error) {
            console.error('Error saving prompt:', error);
        }
    };

    const handleDelete = async (promptId: number) => {
        if (!confirm('Are you sure you want to delete this prompt?')) return;

        try {
            await fetch(`/admin/prompts/${promptId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            router.reload({ only: ['prompts'] });
            handleCancel(promptId);
        } catch (error) {
            console.error('Error deleting prompt:', error);
        }
    };

    const handleInputChange = (promptId: number, field: keyof Prompt, value: string) => {
        setEditingPrompts((prev) => ({
            ...prev,
            [promptId]: {
                ...prev[promptId],
                [field]: value,
            },
        }));
    };

    const isEditing = (promptId: number) => promptId in editingPrompts;
    const hasChanges = (prompt: Prompt) => {
        const edited = editingPrompts[prompt.id];
        return edited && (edited.name !== prompt.name || edited.category !== prompt.category || edited.prompt !== prompt.prompt);
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="container mx-auto p-6">
                <h1 className="mb-6 text-3xl font-bold">Admin Dashboard - Prompts</h1>

                <div className="overflow-x-auto">
                    <table className="table-zebra table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Prompt</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prompts.map((prompt) => {
                                const editing = isEditing(prompt.id);
                                const changed = hasChanges(prompt);
                                const currentPrompt = editing ? editingPrompts[prompt.id] : prompt;

                                return (
                                    <tr key={prompt.id}>
                                        <td>
                                            {editing ? (
                                                <input
                                                    type="text"
                                                    className="input input-bordered w-full"
                                                    value={currentPrompt.name}
                                                    onChange={(e) => handleInputChange(prompt.id, 'name', e.target.value)}
                                                />
                                            ) : (
                                                <span className="hover:bg-base-200 cursor-pointer rounded p-2" onClick={() => handleEdit(prompt)}>
                                                    {prompt.name}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {editing ? (
                                                <input
                                                    type="text"
                                                    className="input input-bordered w-full"
                                                    value={currentPrompt.category}
                                                    onChange={(e) => handleInputChange(prompt.id, 'category', e.target.value)}
                                                />
                                            ) : (
                                                <span className="hover:bg-base-200 cursor-pointer rounded p-2" onClick={() => handleEdit(prompt)}>
                                                    {prompt.category}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {editing ? (
                                                <textarea
                                                    className="textarea textarea-bordered w-full"
                                                    rows={3}
                                                    value={currentPrompt.prompt}
                                                    onChange={(e) => handleInputChange(prompt.id, 'prompt', e.target.value)}
                                                />
                                            ) : (
                                                <span
                                                    className="hover:bg-base-200 block max-w-md cursor-pointer truncate rounded p-2"
                                                    onClick={() => handleEdit(prompt)}
                                                    title={prompt.prompt}
                                                >
                                                    {prompt.prompt}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                {editing ? (
                                                    <>
                                                        <button
                                                            className={`btn btn-success btn-sm ${!changed ? 'btn-disabled' : ''}`}
                                                            onClick={() => handleSave(prompt.id)}
                                                            disabled={!changed}
                                                        >
                                                            Save
                                                        </button>
                                                        <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(prompt.id)}>
                                                            Cancel
                                                        </button>
                                                        <button
                                                            className={`btn btn-error btn-sm ${!changed ? 'btn-disabled' : ''}`}
                                                            onClick={() => handleDelete(prompt.id)}
                                                            disabled={!changed}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(prompt)}>
                                                        Edit
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
