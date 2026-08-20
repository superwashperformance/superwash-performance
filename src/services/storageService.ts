import { supabase } from '../lib/supabase';

export const storageService = {
  /**
   * Comprime una imagen en Base64 usando Canvas
   */
  async compressImageBase64(base64Data: string, maxWidth = 1280, quality = 0.7): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Data);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Force JPEG for better compression
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64Data);
      img.src = base64Data;
    });
  },

  /**
   * Sube un archivo en formato Base64 a Supabase Storage y devuelve su URL pblica.
   * 
   * @param base64Data La cadena Base64 (ej: 'data:image/jpeg;base64,...')
   * @param fileName El nombre original del archivo para mantener la extensin
   * @param bucketName El nombre del bucket en Supabase
   * @returns La URL pblica del archivo subido
   */
  async uploadPhotoBase64(base64Data: string, fileName: string, bucketName: string = 'ods-photos'): Promise<string> {
    try {
      // 1. Comprimir la imagen antes de subirla
      const compressedData = await this.compressImageBase64(base64Data);

      const matches = compressedData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        throw new Error('Formato Base64 invlido');
      }

      const contentType = matches[1];
      const byteCharacters = atob(matches[2]);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const fileBlob = new Blob([byteArray], { type: contentType });

      const fileExt = fileName.split('.').pop() || 'jpg';
      const uniqueName = `photo_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `uploads/${uniqueName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBlob, {
          contentType: contentType,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  }
};
