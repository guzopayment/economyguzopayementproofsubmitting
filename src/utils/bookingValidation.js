export const normalizeSpaces = (value = "") =>
  String(value).replace(/\s+/g, " ").trim();

export const isAlphabeticText = (value) => {
  const cleaned = normalizeSpaces(value);
  if (!cleaned) return false;
  return /^[A-Za-z\u1200-\u137F\s]+$/.test(cleaned);
};

export const sanitizeAlphabeticInput = (value) =>
  String(value || "")
    .replace(/[^A-Za-z\u1200-\u137F\s]/g, "")
    .replace(/\s{2,}/g, " ");

export const sanitizePhoneInput = (value) =>
  String(value || "")
    .replace(/\D/g, "")
    .slice(0, 10);

export const isValidPhone = (value) =>
  /^09\d{8}$/.test(String(value || "").trim());

export const buildStatusMessage = (status) => {
  if (status === "Confirmed") {
    return "ላስገቡት ትክክለኛ የማረጋገጫ ምስል እናመሰግናለን!ያስገቡት የማረጋገጫ መረጃ ጸድቋል፣ ተቀብለነዋል። በእለቱም አስተባባሪ አባላት የሚያሳውቅዎት ይሆናል። | Thank you. Your registration details have been approved and the organizing team will contact you soon.";
  }
  if (status === "Rejected") {
    return "ያስገቡት የማረጋገጫ ምስል ውድቅ ሆኗል! እባክዎ እንደገና ትክክለኛ የሆነውን የማረጋገጫ ምስል ያስገቡ!! የአስተደድር ክፍሉ እንደገና የሚገመግመው ይሆናል። | Your registration details need correction. Please resubmit the correct confirmation image so the organizing team can review it again.";
  }
  return "መልካም። ያስገቡት የማረጋገጫ ምስል በትክክል ደርሷል። የአስገዳድር ክፍሉ እስኪገመግመው ድረስ እባክዎ በትዕግስት ይጠብቁ! | Your registration details have been submitted successfully. Please wait while the organizing team reviews them.";
};
