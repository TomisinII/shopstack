import { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    InputLabel,
    TextInput,
    TextArea,
    SelectInput,
    Toggle,
    SectionCard,
    PrimaryButton,
    SecondaryButton,
} from '@/Components';

export default function Create({ categories, brands, tags }) {
    const fileInputRef = useRef(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [nameToSlug, setNameToSlug] = useState(true);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        sku: '',
        category_id: '',
        brand_id: '',
        short_description: '',
        description: '',
        price: '',
        sale_price: '',
        sale_start: '',
        sale_end: '',
        cost_price: '',
        stock_quantity: 0,
        low_stock_threshold: 5,
        track_inventory: true,
        allow_backorders: false,
        weight: '',
        length: '',
        width: '',
        height: '',
        is_featured: false,
        status: 'draft',
        meta_title: '',
        meta_description: '',
        tags: [],
        images: [],
    });

    const handleNameChange = (e) => {
        const value = e.target.value;
        setData((prev) => ({
            ...prev,
            name: value,
            ...(nameToSlug
                ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
                : {}),
        }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const newPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file), name: file.name }));
        setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
        setData('images', [...(data.images || []), ...files].slice(0, 10));
    };

    const removeImage = (index) => {
        const updated = imagePreviews.filter((_, i) => i !== index);
        setImagePreviews(updated);
        setData('images', updated.map((p) => p.file));
    };

    const toggleTag = (tagId) => {
        setData('tags', data.tags.includes(tagId)
            ? data.tags.filter((id) => id !== tagId)
            : [...data.tags, tagId]
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.store'), { forceFormData: true });
    };

    // Build SelectInput-compatible groups for hierarchical categories
    const parentCategories = categories.filter((c) => !c.parent_id);
    const childCategories  = categories.filter((c) => c.parent_id);
    const categoryGroups   = parentCategories.map((parent) => ({
        label: parent.name,
        options: [
            { value: parent.id, label: parent.name },
            ...childCategories
                .filter((c) => c.parent_id === parent.id)
                .map((c) => ({ value: c.id, label: `— ${c.name}` })),
        ],
    }));

    const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }));

    return (
        <AdminLayout>
            <Head title="Add Product" />

            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href={route('admin.products.index')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
                                <p className="text-sm text-gray-500 mt-0.5">Fill in the details to create a new product</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <SecondaryButton type="button" onClick={() => { setData('status', 'draft'); submit; }}>
                                Save Draft
                            </SecondaryButton>
                            <PrimaryButton type="submit" loading={processing} loadingText="Publishing...">
                                Publish Product
                            </PrimaryButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── Main column ─────────────────────────────── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Basic Information */}
                            <SectionCard title="Basic Information">
                                <div>
                                    <InputLabel htmlFor="name" required>Product Name</InputLabel>
                                    <TextInput
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={handleNameChange}
                                        placeholder="e.g. Premium Cotton T-Shirt"
                                        error={errors.name}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="slug">URL Slug</InputLabel>
                                        <TextInput
                                            id="slug"
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) => { setNameToSlug(false); setData('slug', e.target.value); }}
                                            placeholder="auto-generated"
                                            error={errors.slug}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="sku">SKU</InputLabel>
                                        <TextInput
                                            id="sku"
                                            type="text"
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value)}
                                            placeholder="e.g. TSH-BLK-M"
                                            error={errors.sku}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="short_description">Short Description</InputLabel>
                                    <TextArea
                                        id="short_description"
                                        rows={2}
                                        value={data.short_description}
                                        onChange={(e) => setData('short_description', e.target.value)}
                                        placeholder="Brief summary shown on product cards"
                                        maxLength={500}
                                        error={errors.short_description}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description" required>Full Description</InputLabel>
                                    <TextArea
                                        id="description"
                                        rows={8}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Detailed product description. Supports HTML formatting."
                                        error={errors.description}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Supports HTML formatting</p>
                                </div>
                            </SectionCard>

                            {/* Pricing */}
                            <SectionCard title="Pricing">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="price" required>Regular Price (₦)</InputLabel>
                                        <TextInput
                                            id="price"
                                            type="number"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            error={errors.price}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="sale_price">Sale Price (₦)</InputLabel>
                                        <TextInput
                                            id="sale_price"
                                            type="number"
                                            value={data.sale_price}
                                            onChange={(e) => setData('sale_price', e.target.value)}
                                            placeholder="Leave empty for no sale"
                                            min="0"
                                            step="0.01"
                                            error={errors.sale_price}
                                        />
                                    </div>
                                </div>

                                {data.sale_price && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="sale_start">Sale Start Date</InputLabel>
                                            <TextInput id="sale_start" type="date" value={data.sale_start} onChange={(e) => setData('sale_start', e.target.value)} error={errors.sale_start} />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="sale_end">Sale End Date</InputLabel>
                                            <TextInput id="sale_end" type="date" value={data.sale_end} onChange={(e) => setData('sale_end', e.target.value)} error={errors.sale_end} />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <InputLabel htmlFor="cost_price">Cost Price (₦)</InputLabel>
                                    <TextInput
                                        id="cost_price"
                                        type="number"
                                        value={data.cost_price}
                                        onChange={(e) => setData('cost_price', e.target.value)}
                                        placeholder="Your purchase cost (private, for margin tracking)"
                                        min="0"
                                        step="0.01"
                                        error={errors.cost_price}
                                    />
                                </div>
                            </SectionCard>

                            {/* Inventory */}
                            <SectionCard title="Inventory">
                                <Toggle
                                    id="track_inventory"
                                    checked={data.track_inventory}
                                    onChange={(e) => setData('track_inventory', e.target.checked)}
                                    label="Track inventory"
                                    description="Monitor stock levels and prevent overselling"
                                />

                                {data.track_inventory && (
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <InputLabel htmlFor="stock_quantity" required>Stock Quantity</InputLabel>
                                            <TextInput
                                                id="stock_quantity"
                                                type="number"
                                                value={data.stock_quantity}
                                                onChange={(e) => setData('stock_quantity', parseInt(e.target.value) || 0)}
                                                min="0"
                                                error={errors.stock_quantity}
                                            />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="low_stock_threshold">Low Stock Threshold</InputLabel>
                                            <TextInput
                                                id="low_stock_threshold"
                                                type="number"
                                                value={data.low_stock_threshold}
                                                onChange={(e) => setData('low_stock_threshold', parseInt(e.target.value) || 0)}
                                                min="0"
                                                error={errors.low_stock_threshold}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Toggle
                                    id="allow_backorders"
                                    checked={data.allow_backorders}
                                    onChange={(e) => setData('allow_backorders', e.target.checked)}
                                    label="Allow backorders"
                                    description="Let customers order even when stock runs out"
                                />
                            </SectionCard>

                            {/* Images */}
                            <SectionCard title="Product Images" description="Upload up to 10 images. The first image becomes the primary thumbnail.">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group"
                                >
                                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300 mx-auto mb-3 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-600">Click to upload images</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · Max 5MB each · Up to 10 images</p>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-4 gap-3 mt-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img src={preview.url} alt={preview.name} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                                {index === 0 && (
                                                    <div className="absolute top-1.5 left-1.5 bg-primary-600 text-white text-xs font-medium px-1.5 py-0.5 rounded">Primary</div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center transition-all"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {errors.images && <p className="text-xs text-red-500 mt-2">{errors.images}</p>}
                            </SectionCard>

                            {/* Shipping */}
                            <SectionCard title="Shipping" description="Used to calculate shipping rates at checkout">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="weight">Weight (kg)</InputLabel>
                                        <TextInput id="weight" type="number" value={data.weight} onChange={(e) => setData('weight', e.target.value)} placeholder="0.00" min="0" step="0.01" />
                                    </div>
                                </div>
                                <div>
                                    <InputLabel>Dimensions (cm)</InputLabel>
                                    <div className="grid grid-cols-3 gap-3">
                                        <TextInput type="number" value={data.length} onChange={(e) => setData('length', e.target.value)} placeholder="Length" min="0" step="0.01" />
                                        <TextInput type="number" value={data.width}  onChange={(e) => setData('width',  e.target.value)} placeholder="Width"  min="0" step="0.01" />
                                        <TextInput type="number" value={data.height} onChange={(e) => setData('height', e.target.value)} placeholder="Height" min="0" step="0.01" />
                                    </div>
                                </div>
                            </SectionCard>
                        </div>

                        {/* ── Sidebar ──────────────────────────────────── */}
                        <div className="space-y-6">

                            {/* Status */}
                            <SectionCard title="Status">
                                <div className="space-y-2">
                                    {[
                                        { value: 'draft',     label: 'Draft',     hint: 'Hidden from store, save as work-in-progress' },
                                        { value: 'published', label: 'Published', hint: 'Visible and available in your store'          },
                                        { value: 'archived',  label: 'Archived',  hint: 'Hidden but preserved in records'              },
                                    ].map((s) => (
                                        <label key={s.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 has-[:checked]:border-primary-300 has-[:checked]:bg-primary-50">
                                            <input
                                                type="radio"
                                                name="status"
                                                value={s.value}
                                                checked={data.status === s.value}
                                                onChange={() => setData('status', s.value)}
                                                className="text-primary-600 focus:ring-primary-500"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">{s.label}</span>
                                                <p className="text-xs text-gray-400">{s.hint}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="pt-2">
                                    <Toggle
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onChange={(e) => setData('is_featured', e.target.checked)}
                                        label="Featured product"
                                        description="Show on homepage featured section"
                                    />
                                </div>
                            </SectionCard>

                            {/* Organization */}
                            <SectionCard title="Organization">
                                <div>
                                    <InputLabel htmlFor="category_id" required>Category</InputLabel>
                                    <SelectInput
                                        id="category_id"
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        groups={categoryGroups}
                                        placeholder="Select category"
                                        error={errors.category_id}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="brand_id">Brand</InputLabel>
                                    <SelectInput
                                        id="brand_id"
                                        value={data.brand_id}
                                        onChange={(e) => setData('brand_id', e.target.value)}
                                        options={brandOptions}
                                        placeholder="No brand"
                                    />
                                </div>

                                {tags.length > 0 && (
                                    <div>
                                        <InputLabel>Tags</InputLabel>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {tags.map((tag) => (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() => toggleTag(tag.id)}
                                                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                                                        data.tags.includes(tag.id)
                                                            ? 'bg-primary-600 text-white border-primary-600'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                                                    }`}
                                                >
                                                    {tag.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </SectionCard>

                            {/* SEO */}
                            <SectionCard title="SEO" description="Improve search engine visibility">
                                <div>
                                    <InputLabel htmlFor="meta_title">Meta Title</InputLabel>
                                    <TextInput
                                        id="meta_title"
                                        type="text"
                                        value={data.meta_title}
                                        onChange={(e) => setData('meta_title', e.target.value)}
                                        placeholder="Defaults to product name"
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="meta_description">Meta Description</InputLabel>
                                    <TextArea
                                        id="meta_description"
                                        rows={3}
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        placeholder="Brief description for search results"
                                        maxLength={160}
                                    />
                                </div>
                            </SectionCard>

                            {/* Sidebar actions */}
                            <div className="flex flex-col gap-3">
                                <PrimaryButton type="submit" loading={processing} loadingText="Saving..." className="w-full justify-center">
                                    Publish Product
                                </PrimaryButton>
                                <Link
                                    href={route('admin.products.index')}
                                    className="w-full py-2.5 text-sm font-medium text-center text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}