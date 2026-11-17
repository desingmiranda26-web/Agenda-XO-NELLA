import React, { useState } from 'react';
import { ImagePlus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { SERVICES, type GalleryItem } from '../types.ts';

interface GallerySectionProps {
  items: GalleryItem[];
  isManicurist: boolean;
  onUploadItem: (payload: { serviceId: string; caption: string; imageUrl: string }) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onBookStyle: (item: GalleryItem) => void;
}

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen inválido'));
      img.onload = () => {
        const maxSide = 960;
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          if (width >= height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  items,
  isManicurist,
  onUploadItem,
  onDeleteItem,
  onBookStyle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadServiceId, setUploadServiceId] = useState(SERVICES[0].id);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const filteredItems =
    selectedCategory === 'all'
      ? items
      : items.filter((item) => item.serviceId === selectedCategory);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setUploadPreview(dataUrl);
    } catch {
      setUploadError('No se pudo procesar la foto seleccionada.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPreview) {
      setUploadError('Selecciona una foto de tu galería o cámara.');
      return;
    }
    if (!uploadCaption.trim()) {
      setUploadError('Agrega una descripción breve del diseño.');
      return;
    }

    setIsSubmitting(true);
    setUploadError('');
    try {
      await onUploadItem({
        serviceId: uploadServiceId,
        caption: uploadCaption.trim(),
        imageUrl: uploadPreview,
      });
      setUploadCaption('');
      setUploadPreview('');
      setShowUploadForm(false);
    } catch {
      setUploadError('No se pudo guardar el diseño en la galería.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="galeria" className="py-10 border-t border-[#F5F2EB]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F2EB]">
              02. Galería de Trabajos
            </h2>
            <p className="mt-1 text-sm sm:text-base font-normal text-[#F5F2EB]/70">
              Explora sets reales por categoría de servicio o sube tus diseños recientes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadForm((prev) => !prev)}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#2D0A4E] border border-[#6A0DAD] px-4 py-2 text-sm font-bold text-[#F5F2EB] hover:bg-[#6A0DAD] transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <ImagePlus className="w-4 h-4" />
            {showUploadForm ? 'Cerrar subida' : 'Subir Trabajo'}
          </button>
        </div>

        {/* Upload Drawer */}
        {showUploadForm && (
          <form
            onSubmit={(e) => void handleUploadSubmit(e)}
            className="mb-8 rounded-3xl bg-[#2D0A4E] border border-[#F5F2EB]/15 p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-[#F5F2EB]">
                Publicar nuevo set en la galería
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#F5F2EB]/70 hover:text-[#F5F2EB] cursor-pointer"
                aria-label="Cerrar formulario"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-normal text-[#F5F2EB]/75 mb-1.5">
                  Categoría del servicio
                </label>
                <select
                  value={uploadServiceId}
                  onChange={(e) => setUploadServiceId(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl bg-[#121212] border border-[#F5F2EB]/20 px-3 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#6A0DAD]"
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.price}€)
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-normal text-[#F5F2EB]/75 mb-1.5">
                  Descripción / Título del set
                </label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Ej. Jelly tips morado aura con detalles plateados 3D"
                  className="w-full min-h-[44px] rounded-xl bg-[#121212] border border-[#F5F2EB]/20 px-3.5 text-sm text-[#F5F2EB] placeholder:text-[#F5F2EB]/40 focus:outline-none focus:border-[#6A0DAD]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#121212] border border-[#F5F2EB]/25 px-4 py-2 text-sm font-bold text-[#F5F2EB] hover:border-[#6A0DAD] cursor-pointer">
                <Upload className="w-4 h-4" />
                Elegir foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleFileChange(e)}
                  className="sr-only"
                />
              </label>

              {uploadPreview && (
                <div className="flex items-center gap-3">
                  <img
                    src={uploadPreview}
                    alt="Vista previa del diseño"
                    className="w-14 h-14 rounded-xl object-cover border border-[#F5F2EB]/20"
                  />
                  <span className="text-xs text-[#F5F2EB]/80">Imagen lista para publicar</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="sm:ml-auto min-h-[44px] px-6 py-2 rounded-xl bg-[#6A0DAD] hover:bg-[#7B18C8] disabled:opacity-50 text-sm font-bold text-[#F5F2EB] transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Publicando...' : 'Guardar en Galería'}
              </button>
            </div>

            {uploadError && (
              <p className="text-sm font-normal text-[#FCA5A5]">{uploadError}</p>
            )}
          </form>
        )}

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filtrar galería por categoría"
          className="flex items-center gap-2 overflow-x-auto pb-3 mb-6"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#6A0DAD] text-[#F5F2EB]'
                : 'bg-[#1A1622] text-[#F5F2EB]/70 border border-[#F5F2EB]/10 hover:text-[#F5F2EB]'
            }`}
          >
            Todos ({items.length})
          </button>

          {SERVICES.map((srv) => {
            const count = items.filter((i) => i.serviceId === srv.id).length;
            const active = selectedCategory === srv.id;
            return (
              <button
                key={srv.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(srv.id)}
                className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#6A0DAD] text-[#F5F2EB]'
                    : 'bg-[#1A1622] text-[#F5F2EB]/70 border border-[#F5F2EB]/10 hover:text-[#F5F2EB]'
                }`}
              >
                {srv.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl bg-[#1A1622] border border-[#F5F2EB]/10 p-10 text-center">
            <p className="text-base font-bold text-[#F5F2EB]">
              Aún no hay fotos en esta categoría
            </p>
            <p className="mt-1 text-sm font-normal text-[#F5F2EB]/65">
              Usa el botón &ldquo;Subir Trabajo&rdquo; para añadir diseños de este servicio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl overflow-hidden bg-[#1A1622] border border-[#F5F2EB]/10 flex flex-col justify-between"
              >
                <button
                  type="button"
                  onClick={() => setLightboxItem(item)}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-[#2D0A4E] cursor-pointer block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6A0DAD]"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                  />
                </button>

                <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                  <div>
                    <p className="text-xs font-normal text-[#C084FC]">
                      {item.serviceName}
                    </p>
                    <p className="mt-1.5 text-sm sm:text-base font-bold text-[#F5F2EB] leading-snug">
                      {item.caption}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#F5F2EB]/10">
                    <button
                      type="button"
                      onClick={() => onBookStyle(item)}
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-[#2D0A4E] hover:bg-[#6A0DAD] px-3.5 py-2 text-xs font-bold text-[#F5F2EB] transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Reservar este estilo
                    </button>

                    {isManicurist && (
                      <button
                        type="button"
                        onClick={() => void onDeleteItem(item.id)}
                        aria-label="Eliminar foto de galería"
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#F5F2EB]/60 hover:text-[#FCA5A5] hover:bg-[#2D0A4E] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="w-full max-w-xl rounded-3xl overflow-hidden bg-[#1A1622] border border-[#F5F2EB]/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] bg-[#121212]">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.caption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                aria-label="Cerrar vista"
                className="absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#121212]/80 text-[#F5F2EB] hover:bg-[#6A0DAD] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-normal text-[#C084FC]">{lightboxItem.serviceName}</p>
                <p className="mt-1 text-base font-bold text-[#F5F2EB]">{lightboxItem.caption}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onBookStyle(lightboxItem);
                  setLightboxItem(null);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#6A0DAD] hover:bg-[#7B18C8] text-xs font-bold text-[#F5F2EB] shrink-0 cursor-pointer"
              >
                Usar referencia
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
