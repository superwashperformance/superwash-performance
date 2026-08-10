import { supabase } from '../lib/supabase';

export const storageService = {
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
      const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      
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
