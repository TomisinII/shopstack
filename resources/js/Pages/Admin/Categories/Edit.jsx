import { useForm } from '@inertiajs/react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { InputLabel, TextInput, TextArea, SelectInput, Toggle, PrimaryButton, SectionCard, SecondaryButton } from '@/Components';

export default function Edit({ category, parents }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        parent_id: category.parent_id ?? '',
        is_active: category.is_active,
        sort_order: category.sort_order ?? 0,
        meta_title: category.meta_title ?? '',
        meta_description: category.meta_description ?? '',
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.categories.update', category.id), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title={`Edit – ${category.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href={route('admin.categories.index')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{category.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── Main ── */}
                        <div className="lg:col-span-2 space-y-6">
                            <SectionCard title="Basic Information">
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel htmlFor="name">Category Name</InputLabel>
                                        <TextInput
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Electronics"
                                            error={errors.name}
                                            autoFocus
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="slug">Slug</InputLabel>
                                        <div className="mt-1.5 relative">
                                            <span className="absolute inset-y-0 left-3.5 flex items-center text-xs text-gray-400 pointer-events-none select-none">
                                                /category/
                                            </span>
                                            <TextInput
                                                id="slug"
                                                value={data.slug}
                                                onChange={(e) => setData('slug', e.target.value)}
                                                placeholder="electronics"
                                                error={errors.slug}
                                                className="pl-20"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="description">Description</InputLabel>
                                        <TextArea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description of this category..."
                                            rows={3}
                                            error={errors.description}
                                            className="mt-1.5"
                                        />
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Image */}
                            <SectionCard title="Category Image">
                                {category.image && !data.image && (
                                    <div className="mb-4 flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <img src={`/storage/${category.image}`} alt={category.name} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Current image</p>
                                            <p className="text-xs text-gray-400">Upload a new image to replace it</p>
                                        </div>
                                    </div>
                                )}
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 transition-colors">
                                    {data.image ? (
                                        <div className="space-y-3">
                                            <img src={URL.createObjectURL(data.image)} alt="Preview" className="mx-auto h-32 w-32 rounded-lg object-cover" />
                                            <p className="text-sm text-gray-600">{data.image.name}</p>
                                            <button type="button" onClick={() => setData('image', null)} className="text-xs text-red-500 hover:text-red-600 font-medium">
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <label htmlFor="image" className="cursor-pointer">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-gray-700">Click to upload new image</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                                        </label>
                                    )}
                                    <input id="image" type="file" accept="image/*" className="hidden" onChange={(e) => setData('image', e.target.files[0] ?? null)} />
                                </div>
                                {errors.image && <p className="text-xs text-red-500 mt-1.5">{errors.image}</p>}
                            </SectionCard>

                            {/* SEO */}
                            <SectionCard title="SEO" description="Improve search engine visibility">
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel htmlFor="meta_title">Meta Title</InputLabel>
                                        <TextInput
                                            id="meta_title"
                                            value={data.meta_title}
                                            onChange={(e) => setData('meta_title', e.target.value)}
                                            placeholder={data.name || 'Category name'}
                                            error={errors.meta_title}
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="meta_description">Meta Description</InputLabel>
                                        <TextArea
                                            id="meta_description"
                                            value={data.meta_description}
                                            onChange={(e) => setData('meta_description', e.target.value)}
                                            placeholder="Brief description for search engines..."
                                            rows={2}
                                            maxLength={500}
                                            error={errors.meta_description}
                                            className="mt-1.5"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">{data.meta_description.length}/500</p>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>

                        {/* ── Sidebar ── */}
                        <div className="space-y-6">
                            <SectionCard title="Settings">
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel htmlFor="parent_id">Parent Category</InputLabel>
                                        <SelectInput
                                            id="parent_id"
                                            value={data.parent_id}
                                            onChange={(e) => setData('parent_id', e.target.value)}
                                            options={[
                                                { value: '', label: 'None (Top Level)' },
                                                ...parents.map((p) => ({ value: p.id, label: p.name })),
                                            ]}
                                            error={errors.parent_id}
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="sort_order">Sort Order</InputLabel>
                                        <TextInput
                                            id="sort_order"
                                            type="number"
                                            min="0"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                            error={errors.sort_order}
                                            className="mt-1.5"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Active</p>
                                            <p className="text-xs text-gray-400">Visible on the storefront</p>
                                        </div>
                                        <Toggle
                                            checked={data.is_active}
                                            onChange={(val) => setData('is_active', val)}
                                        />
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <PrimaryButton type="submit" loading={processing} loadingText="Saving..." className="w-full justify-center">
                                    Save Changes
                                </PrimaryButton>
                                <SecondaryButton onClick={() => window.history.back()} className="w-full justify-center">
                                    Cancel
                                </SecondaryButton>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}