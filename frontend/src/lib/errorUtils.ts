import type { TFunction } from 'i18next';

// دالة لتحويل الأخطاء التقنية إلى رسائل مفهومة للمستخدم
export const getUserFriendlyError = (error: any, t: TFunction): string => {
  if (!error) return t('error.generic');
  
  const errorMessage = error.message || error.toString().toLowerCase();
  
  // أخطاء الشبكة
  if (errorMessage.includes('network') || 
      errorMessage.includes('fetch') || 
      errorMessage.includes('connection') ||
      errorMessage.includes('net::err_')) {
    return t('error.networkProblem');
  }
  
  // أخطاء الخادم
  if (errorMessage.includes('server') || 
      errorMessage.includes('500') || 
      errorMessage.includes('502') ||
      errorMessage.includes('503') ||
      errorMessage.includes('504')) {
    return t('error.serverProblem');
  }
  
  // أخطاء المهلة الزمنية
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return t('error.timeout');
  }
  
  // أخطاء المصادقة
  if (errorMessage.includes('unauthorized') || 
      errorMessage.includes('401') ||
      errorMessage.includes('invalid credentials')) {
    return t('error.invalidCredentials');
  }
  
  // أخطاء غير مصرح بها
  if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
    return t('error.unauthorized');
  }
  
  // أخطاء غير موجود
  if (errorMessage.includes('not found') || 
      errorMessage.includes('404') ||
      errorMessage.includes('does not exist')) {
    return t('error.notFound');
  }
  
  // أخطاء البريد الإلكتروني المستخدم
  if (errorMessage.includes('email') && 
      (errorMessage.includes('exist') || errorMessage.includes('already'))) {
    return t('error.emailAlreadyExists');
  }
  
  // أخطاء كلمة المرور
  if (errorMessage.includes('password') && 
      (errorMessage.includes('weak') || errorMessage.includes('too short'))) {
    return t('error.weakPassword');
  }
  
  // أخطاء التحقق من صحة البيانات
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    if (errorMessage.includes('email')) {
      return t('error.invalidEmail');
    }
    if (errorMessage.includes('password')) {
      return t('error.passwordTooShort');
    }
    if (errorMessage.includes('name')) {
      return t('error.nameTooShort');
    }
  }
  
  // رسالة عامة للأخطاء الأخرى
  return t('error.generic');
};

// دالة لمعالجة أخطاء محددة حسب السياق
export const getContextualError = (error: any, context: string, t: TFunction): string => {
  const baseError = getUserFriendlyError(error, t);
  
  switch (context) {
    case 'login':
      return error?.message?.includes('credentials') ? 
        t('error.invalidCredentials') : 
        t('error.loginFailed');
    
    case 'signup':
      return error?.message?.includes('email') && error?.message?.includes('exist') ?
        t('error.emailAlreadyExists') :
        t('error.signupFailed');
    
    case 'cart':
      return t('error.cartError');
    
    case 'products':
      return t('error.productError');
    
    case 'categories':
      return t('error.categoryError');
    
    case 'checkout':
      return t('error.checkoutError');
    
    default:
      return baseError;
  }
};

// دالة لإضافة تفاصيل إضافية للخطأ
export const formatErrorWithDetails = (error: any, t: TFunction): string => {
  const friendlyError = getUserFriendlyError(error, t);
  
  // إضافة نص مساعد بناءً على نوع الخطأ
  if (friendlyError.includes('🔌')) {
    return `${friendlyError}\n\n💡 جرب:\n• التحقق من Wi-Fi أو بيانات الجوال\n• إعادة تحميل الصفحة`;
  }
  
  if (friendlyError.includes('🛠️')) {
    return `${friendlyError}\n\n💡 جرب:\n• المحاولة بعد قليل\n• إعادة تحميل الصفحة`;
  }
  
  return friendlyError;
};
