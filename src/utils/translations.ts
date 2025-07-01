
export const translations = {
  en: {
    title: "DR3K DEMO",
    description: "Instant SMS registration demo.",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    phonePlaceholder: "+9687XXXXXXX",
    registerButton: "Register",
    registering: "Registering...",
    successToast: "✅ You are registered! Check your phone.",
    errorToast: "❌ Something went wrong.",
    requiredField: "This field is required",
    invalidPhone: "Please enter a valid phone number starting with +"
  },
  ar: {
    title: "تجربة DR3K",
    description: "تجربة تسجيل تُرسل رسالة نصية فورية.",
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    phonePlaceholder: "+9687XXXXXXX",
    registerButton: "سجِّل",
    registering: "جاري التسجيل...",
    successToast: "✅ تم التسجيل! تحقق من هاتفك.",
    errorToast: "❌ حدث خطأ ما.",
    requiredField: "هذا الحقل مطلوب",
    invalidPhone: "يرجى إدخال رقم هاتف صحيح يبدأ بـ +"
  }
};

export type Language = 'en' | 'ar';
