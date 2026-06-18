export function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function mapSexToBucket(value) {
  const safe = normalizeText(value);
  if (safe === "ወንድ" || safe.toLowerCase() === "male") return "male";
  if (safe === "ሴት" || safe.toLowerCase() === "female") return "female";
  return "unknown";
}

export function flattenConfirmedBookings(bookings = []) {
  const rows = [];
  let runningIndex = 1;

  bookings.forEach((booking) => {
    const mainRow = {
      serial: runningIndex,
      bookingId: String(booking._id || ""),
      role: "main",
      name: normalizeText(booking.name) || "—",
      organization: normalizeText(booking.organization) || "ሌላ ያልተገለጸ",
      phone: normalizeText(booking.phone) || "—",
      sex: normalizeText(booking.sex) || "—",
      subCity: normalizeText(booking.subCity) || "ሌላ ያልተገለጸ",
      paymentProof: booking.paymentProof || "",
      submittedAt: booking.createdAt || booking.updatedAt || "",
      participantsCount: Number(booking.participants || 0),
      sourceBooking: booking,
      participantLabel: "ዋና ተሳታፊ",
    };
    rows.push(mainRow);
    runningIndex += 1;

    const extras = Array.isArray(booking.participantDetails)
      ? booking.participantDetails
      : [];

    extras.forEach((participant, index) => {
      rows.push({
        serial: runningIndex,
        bookingId: String(booking._id || ""),
        role: "sub",
        name: normalizeText(participant?.name) || `ተሳታፊ ${index + 2}`,
        organization:
          normalizeText(participant?.organization) ||
          normalizeText(booking.organization) ||
          "ሌላ ያልተገለጸ",
        phone: normalizeText(participant?.phone) || "—",
        sex: normalizeText(participant?.sex) || "—",
        subCity:
          normalizeText(participant?.subCity) ||
          normalizeText(booking.subCity) ||
          "ሌላ ያልተገለጸ",
        paymentProof: booking.paymentProof || "",
        submittedAt: booking.createdAt || booking.updatedAt || "",
        participantsCount: "Sub participant",
        sourceBooking: booking,
        participantLabel: `ተሳታፊ ${index + 2}`,
      });
      runningIndex += 1;
    });
  });

  return rows;
}

export function buildOrganizationSummary(flatRows = []) {
  const summary = new Map();

  flatRows.forEach((row) => {
    const organization = normalizeText(row.organization) || "ሌላ ያልተገለጸ";
    if (!summary.has(organization)) {
      summary.set(organization, {
        id: summary.size + 1,
        organization,
        totalParticipants: 0,
        men: 0,
        women: 0,
        subCities: new Set(),
      });
    }

    const entry = summary.get(organization);
    entry.totalParticipants += 1;
    const bucket = mapSexToBucket(row.sex);
    if (bucket === "male") entry.men += 1;
    if (bucket === "female") entry.women += 1;
    if (normalizeText(row.subCity))
      entry.subCities.add(normalizeText(row.subCity));
  });

  return Array.from(summary.values()).map((entry) => ({
    id: entry.id,
    organization: entry.organization,
    totalParticipants: entry.totalParticipants,
    men: entry.men,
    women: entry.women,
    subCitiesCount: entry.subCities.size,
  }));
}

export function groupParticipantRows(flatRows = [], keyName) {
  const grouped = new Map();

  flatRows.forEach((row) => {
    const key = normalizeText(row[keyName]) || "ሌላ ያልተገለጸ";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  });

  return Array.from(grouped.entries())
    .map(([key, rows]) => ({
      key,
      rows,
    }))
    .sort(
      (a, b) => b.rows.length - a.rows.length || a.key.localeCompare(b.key),
    );
}
