import { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import {
    InputLabel, TextInput, TextArea, SelectInput,
    Toggle, SectionCard, PrimaryButton, SecondaryButton,
} from '@/Components';

export default function Edit({ product, categories, brands, tags }) {
    const fileInputRef = useRef(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [removedIds, setRemovedIds]       = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        _method:              'PUT',
        name:                 product.name,
        slug:                 product.slug,
        sku:                  product.sku ?? '',
        category_id:          product.category_id ?? '',
        brand_id:             product.brand_id ?? '',
        short_description:    product.short_description ?? '',
        description:          product.description ?? '',
        price:                product.price,
        sale_price:           product.sale_price ?? '',
        sale_start:           product.sale_start ?? '',
        sale_end:             product.sale_end ?? '',
        cost_price:           product.cost_price ?? '',
        stock_quantity:       product.stock_quantity,
        low_stock_threshold:  product.low_stock_threshold ?? 5,
        track_inventory:      product.track_inventory,
        allow_backorders:     product.allow_backorders,
        weight:               product.weight ?? '',
        length:               product.length ?? '',
        width:                product.width ?? '',
        height:               product.height ?? '',
        is_featured:          product.is_featured,
        status:               product.status,
        meta_title:           product.meta_title ?? '',
        meta_description:     product.meta_description ?? '',
        tags:                 product.tags ?? [],
        images:               [],
        removed_image_ids:    [],
    });

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const previews = files.map((f) => ({ file: f, url: URL.createObjectURL(f), name: f.name }));
        setImagePreviews((prev) => [...prev, ...previews]);
        setData('images', [...(data.images || []), ...files]);
    };

    const removeNewImage = (index) => {
        const updated = imagePreviews.filter((_, i) => i !== index);
        setImagePreviews(updated);
        setData('images', updated.map((p) => p.file));
    };

    const removeExistingImage = (imageId) => {
        const updated = [...removedIds, imageId];
        setRemovedIds(updated);
        setData('removed_image_ids', updated);
    };

    const toggleTag = (tagId) => {
        setData('tags', data.tags.includes(tagId)
            ? data.tags.filter((id) => id !== tagId)
            : [...data.tags, tagId]);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('vendor.products.update', product.id), { forceFormData: true });
    };

    const parentCats     = categories.filter((c) => !c.parent_id);
    const childCats      = categories.filter((c) => c.parent_id);
    const categoryGroups = parentCats.map((parent) => ({
        label: parent.name,
        options: [
            { value: parent.id, label: parent.name },
            ...childCats.filter((c) => c.parent_id === parent.id).map((c) => ({ value: c.id, label: `— ${c.name}` })),
        ],
    }));

    const existingImages = (product.images ?? []).filter((img) => !removedIds.includes(img.id));

    return (
        <VendorLayout>
            <Head title={`Edit: ${product.name}`} />

            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href={route('vendor.products.index')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                                <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{product.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <SecondaryButton type="button" onClick={() => setData('status', 'draft')}>
                                Save as Draft
                            </SecondaryButton>
                            <PrimaryButton type="submit" loading={processing} loadingText="Saving...">
                                Save Changes
                            </PrimaryButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Main */}
                        <div className="lg:col-span-2 space-y-6">

                            <SectionCard title="Basic Information">
                                <div>
                                    <InputLabel htmlFor="name" required>Product Name</InputLabel>
                                    <TextInput id="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="slug">URL Slug</InputLabel>
                                        <TextInput id="slug" type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="sku">SKU</InputLabel>
                                        <TextInput id="sku" type="text" value={data.sku} onChange={(e) => setData('sku', e.target.value)} error={errors.sku} />
                                    </div>
                                </div>
                                <div>
                                    <InputLabel htmlFor="short_description">Short Description</InputLabel>
                                    <TextArea id="short_description" rows={2} value={data.short_description} onChange={(e) => setData('short_description', e.target.value)} maxLength={500} error={errors.short_description} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="description" required>Full Description</InputLabel>
                                    <TextArea id="description" rows={8} value={data.description} onChange={(e) => setData('description', e.target.value)} error={errors.description} />
                                    <p className="text-xs text-gray-400 mt-1">Supports HTML formatting</p>
                                </div>
                            </SectionCard>

                            <SectionCard title="Pricing">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="price" required>Regular Price (₦)</InputLabel>
                                        <TextInput id="price" type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} min="0" step="0.01" error={errors.price} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="sale_price">Sale Price (₦)</InputLabel>
                                        <TextInput id="sale_price" type="number" value={data.sale_price} onChange={(e) => setData('sale_price', e.target.value)} placeholder="Leave empty for no sale" min="0" step="0.01" error={errors.sale_price} />
                                    </div>
                                </div>
                                {data.sale_price && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="sale_start">Sale Start</InputLabel>
                                            <TextInput id="sale_start" type="date" value={data.sale_start} onChange={(e) => setData('sale_start', e.target.value)} error={errors.sale_start} />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="sale_end">Sale End</InputLabel>
                                            <TextInput id="sale_end" type="date" value={data.sale_end} onChange={(e) => setData('sale_end', e.target.value)} error={errors.sale_end} />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <InputLabel htmlFor="cost_price">Cost Price (₦)</InputLabel>
                                    <TextInput id="cost_price" type="number" value={data.cost_price} onChange={(e) => setData('cost_price', e.target.value)} placeholder="Private — for margin tracking" min="0" step="0.01" />
                                </div>
                            </SectionCard>

                            <SectionCard title="Inventory">
                                <Toggle id="track_inventory" checked={data.track_inventory} onChange={(e) => setData('track_inventory', e.target.checked)} label="Track inventory" description="Monitor stock levels and prevent overselling" />
                                {data.track_inventory && (
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <InputLabel htmlFor="stock_quantity" required>Stock Quantity</InputLabel>
                                            <TextInput id="stock_quantity" type="number" value={data.stock_quantity} onChange={(e) => setData('stock_quantity', parseInt(e.target.value) || 0)} min="0" error={errors.stock_quantity} />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="low_stock_threshold">Low Stock Threshold</InputLabel>
                                            <TextInput id="low_stock_threshold" type="number" value={data.low_stock_threshold} onChange={(e) => setData('low_stock_threshold', parseInt(e.target.value) || 0)} min="0" />
                                        </div>
                                    </div>
                                )}
                                <Toggle id="allow_backorders" checked={data.allow_backorders} onChange={(e) => setData('allow_backorders', e.target.checked)} label="Allow backorders" description="Let customers order even when stock runs out" />
                            </SectionCard>

                            {/* Images */}
                            <SectionCard title="Product Images" description="Upload up to 10 images. The first becomes the primary thumbnail.">
                                {/* Existing images */}
                                {existingImages.length > 0 && (
                                    <div className="grid grid-cols-4 gap-3">
                                        {existingImages.map((img) => (
                                            <div key={img.id} className="relative group aspect-square">
                                                <img src={img.image_path} alt={img.alt_text || ''} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                                {img.is_primary && (
                                                    <div className="absolute top-1.5 left-1.5 bg-primary-600 text-white text-xs font-medium px-1.5 py-0.5 rounded">Primary</div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(img.id)}
                                                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload new */}
                                <div onClick={() => fileInputRef.current?.click()} className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group">
                                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm text-gray-500">Click to add more images</p>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-4 gap-3">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img src={preview.url} alt={preview.name} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                                <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>

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

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <SectionCard title="Status">
                                <div className="space-y-2">
                                    {[
                                        { value: 'draft',     label: 'Draft',     hint: 'Save without publishing' },
                                        { value: 'published', label: 'Published', hint: 'Visible in your store'   },
                                        { value: 'archived',  label: 'Archived',  hint: 'Hidden from store'       },
                                    ].map((s) => (
                                        <label key={s.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 has-[:checked]:border-primary-300 has-[:checked]:bg-primary-50">
                                            <input type="radio" name="status" value={s.value} checked={data.status === s.value} onChange={() => setData('status', s.value)} className="text-primary-600 focus:ring-primary-500" />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">{s.label}</span>
                                                <p className="text-xs text-gray-400">{s.hint}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="pt-2">
                                    <Toggle id="is_featured" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} label="Featured product" description="Show on homepage featured section" />
                                </div>
                            </SectionCard>

                            <SectionCard title="Organization">
                                <div>
                                    <InputLabel htmlFor="category_id" required>Category</InputLabel>
                                    <SelectInput id="category_id" value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} groups={categoryGroups} placeholder="Select category" error={errors.category_id} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="brand_id">Brand</InputLabel>
                                    <SelectInput id="brand_id" value={data.brand_id} onChange={(e) => setData('brand_id', e.target.value)} options={brands.map((b) => ({ value: b.id, label: b.name }))} placeholder="No brand" />
                                </div>
                                {tags.length > 0 && (
                                    <div>
                                        <InputLabel>Tags</InputLabel>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {tags.map((tag) => (
                                                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                                                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                                                        data.tags.includes(tag.id)
                                                            ? 'bg-primary-600 text-white border-primary-600'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                                                    }`}
                                                >{tag.name}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </SectionCard>

                            <SectionCard title="SEO" description="Improve search engine visibility">
                                <div>
                                    <InputLabel htmlFor="meta_title">Meta Title</InputLabel>
                                    <TextInput id="meta_title" type="text" value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} placeholder="Defaults to product name" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="meta_description">Meta Description</InputLabel>
                                    <TextArea id="meta_description" rows={3} value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} placeholder="Brief description for search results" maxLength={160} />
                                </div>
                            </SectionCard>

                            <div className="flex flex-col gap-3">
                                <PrimaryButton type="submit" loading={processing} loadingText="Saving..." className="w-full justify-center">
                                    Save Changes
                                </PrimaryButton>
                                <Link href={route('vendor.products.index')} className="w-full py-2.5 text-sm font-medium text-center text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </VendorLayout>
    );
}