/**
 * خدمة تحميل الملفات
 * لإدارة رفع الوثائق ومرفقات الطلبات والملفات النهائية
 */

import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

// مسارات حفظ الملفات (في الإصدار الحقيقي، سيتم استخدام خدمة سحابية مثل S3)
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const REQUEST_ATTACHMENTS_DIR = path.join(UPLOAD_DIR, 'requests');
const PROVIDER_DOCS_DIR = path.join(UPLOAD_DIR, 'provider-docs');
const DELIVERABLES_DIR = path.join(UPLOAD_DIR, 'deliverables');

// إنشاء المجلدات إذا لم تكن موجودة
export function initUploadDirs() {
  const dirs = [UPLOAD_DIR, REQUEST_ATTACHMENTS_DIR, PROVIDER_DOCS_DIR, DELIVERABLES_DIR];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * أنواع الملفات المدعومة (سيتم توسيعها حسب الحاجة)
 */
export enum FileType {
  REQUEST_ATTACHMENT = 'request-attachment',
  PROVIDER_DOC = 'provider-doc',
  DELIVERABLE = 'deliverable',
}

/**
 * تحميل ملف وحفظه محليًا
 * @param fileBuffer بيانات الملف
 * @param filename اسم الملف
 * @param fileType نوع الملف
 * @param referenceId معرف الكيان المرتبط (طلب أو مستخدم)
 * @returns معلومات الملف المحفوظ
 */
export function saveFile(
  fileBuffer: Buffer,
  filename: string,
  fileType: FileType,
  referenceId: number
) {
  // توليد اسم فريد للملف
  const fileExt = path.extname(filename);
  const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
  const safeFilename = `${Date.now()}_${fileHash}${fileExt}`;
  
  // تحديد مجلد الحفظ حسب نوع الملف
  let saveDir: string;
  
  switch (fileType) {
    case FileType.REQUEST_ATTACHMENT:
      saveDir = path.join(REQUEST_ATTACHMENTS_DIR, `request_${referenceId}`);
      break;
    case FileType.PROVIDER_DOC:
      saveDir = path.join(PROVIDER_DOCS_DIR, `provider_${referenceId}`);
      break;
    case FileType.DELIVERABLE:
      saveDir = path.join(DELIVERABLES_DIR, `request_${referenceId}`);
      break;
    default:
      throw new Error('نوع ملف غير مدعوم');
  }
  
  // إنشاء مجلد الحفظ إذا لم يكن موجودًا
  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }
  
  // حفظ الملف
  const filePath = path.join(saveDir, safeFilename);
  fs.writeFileSync(filePath, fileBuffer);
  
  // إرجاع معلومات الملف
  const relativePath = path.relative(UPLOAD_DIR, filePath);
  const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;
  
  return {
    originalName: filename,
    savedName: safeFilename,
    url: fileUrl,
    size: fileBuffer.length,
    mimeType: getMimeType(fileExt),
    uploadedAt: new Date(),
  };
}

/**
 * حذف ملف
 * @param filePath مسار الملف النسبي (الـURL بدون "/uploads/")
 * @returns نجاح العملية
 */
export function deleteFile(filePath: string) {
  try {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    
    // التحقق من وجود الملف
    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        message: 'الملف غير موجود'
      };
    }
    
    // حذف الملف
    fs.unlinkSync(fullPath);
    
    return {
      success: true,
      message: 'تم حذف الملف بنجاح'
    };
  } catch (error) {
    console.error('خطأ في حذف الملف:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء محاولة حذف الملف'
    };
  }
}

/**
 * هل الملف من نوع صورة
 * @param filename اسم الملف
 * @returns هل الملف صورة
 */
export function isImage(filename: string) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

/**
 * هل الملف من نوع مستند
 * @param filename اسم الملف
 * @returns هل الملف مستند
 */
export function isDocument(filename: string) {
  const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
  const ext = path.extname(filename).toLowerCase();
  return documentExtensions.includes(ext);
}

/**
 * الحصول على نوع MIME للملف بناءً على امتداده
 * @param extension امتداد الملف
 * @returns نوع MIME
 */
function getMimeType(extension: string): string {
  const mimeTypes: { [ext: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
  };
  
  extension = extension.toLowerCase();
  return mimeTypes[extension] || 'application/octet-stream';
}

// تهيئة مجلدات التحميل عند تشغيل الخدمة
initUploadDirs(); 