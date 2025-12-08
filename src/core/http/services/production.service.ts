import { getConnection } from "../../db/db";

export interface CarteProduction {
  id?: number;
  location_of_enrolment?: string;
  enrolment_type_id?: number;
  request_reason_id?: number;
  original_enrolment_type_id?: number;
  reception_no?: string;
  last_name?: string;
  first_name?: string;
  maiden_name?: string;
  sur_name?: string;
  nickname?: string;
  gender_id?: number;
  dob?: Date;
  place_of_birth?: string;
  fathers_name?: string;
  fathers_dob?: Date;
  mothers_name?: string;
  mothers_dob?: Date;
  locality_id?: number;
  locality_of_origin?: string;
  identity_doc_type_id?: number;
  identity_doc_number?: string;
  identity_established_by?: string;
  identity_established_date?: Date;
  payment_number?: string;
  payment_date?: Date;
  form_number?: string;
  delegate_id?: number;
  exception_code?: string;
  place_of_residence_burkina?: string;
  place_of_local_residence?: string;
  address?: string;
  taille?: string;
  teint?: string;
  teint_id?: number;
  blood_group_id?: number;
  blood_group?: string;
  contact_person?: string;
  contact_person_phone?: string;
  phone_no?: string;
  profession_id?: number;
  other_profession?: string;
  unique_code: string;
  receipt_withdrawal_date?: Date;
  user_id?: number;
  device_id?: number;
  kit_key?: string;
  tablet_data_position?: string;
  xml_filename?: string;
  apk_version?: string;
  no_of_documents?: number;
  no_of_fingerprints?: number;
  no_of_fingerimages?: number;
  no_of_wsq_fingerimages?: number;
  synch_delivery_status?: string;
  validation_status?: string;
  duplicate_reason_id?: number;
  edit_status?: string;
  synch_tried?: number;
  reg_start_time?: Date;
  reg_end_time?: Date;
  is_card_issued?: boolean;
  issuing_date_time?: Date;
  date_time?: Date;
  is_active?: boolean;
  datecomparer?: Date;
  syn_date_time?: Date;
  centralise_datetime?: Date;
  is_recentralized?: boolean;
  is_profpic_updated?: boolean;
  profpic_updated_date?: Date;
  is_data_complete?: boolean;
  is_blocked?: boolean;
  renewal_date_time?: Date;
  renewal_user_id?: number;
  renewal_device_id?: number;
  renewal_apk_version?: string;
  consulate_id?: number;
  district_id?: number;
  region_id?: number;
  department_id?: number;
  subprefecture_id?: number;
  country_birth_id?: number;
  postal_address?: string;
  enrollment_center_id?: number;
  special_signs?: string;
  department_birth_id?: number;
  village_city_birth?: string;
  commune_id?: number;
  father_firstname?: string;
  mother_firstname?: string;
  contact_person_firstname?: string;
  collection_point_id?: number;
  pin_number?: string;
  administrative_number?: string;
  diplomatic_mission_number?: string;
  current_validation_status_id?: number;
  current_validation_comment?: string;
  village?: string;
  recentralize_date_time?: Date;
  contact_person_address?: string;
  department_out_of_ci?: string;
  location_of_enrolment_id?: number;
  old_receipt_no?: string;
  is_transfert_to_prod?: boolean;
  permanent_address?: string;
  village_residence?: string;
  is_selected?: boolean;
  is_distributed?: boolean | null | number;
  is_produced?: boolean | null | number;
  production_date?: Date;
  distribution_date?: Date;

  // Champs applicatifs supplémentaires
  urlphoto?: string;
  photo?: Buffer;
  urlsignature?: string;
  signature?: Buffer;
  status?: "pending" | "produced" | "distributed";
  compteur?: number;
}


function bufferToBase64Field(item: any, fieldName: string, mime = "image/png") {
  if (item && item[fieldName]) {
    const buffer = item[fieldName] as Buffer;
    item[`${fieldName}Base64`] = `data:${mime};base64,${buffer.toString("base64")}`;
    item[fieldName] = undefined;
  }
}

/* --------------------------------------------- 🔍 Obtenir une carte par unique_code ------------------------------------------------ */


/* --------------------------------------------- 📌 Récupérer toutes les cartes ------------------------------------------------ */
interface GetCarteParams {
  page: number;
  limit: number;
  is_distributed?: string;
  is_produced?: string;
}
function formatDate(date: any, format: "DD/MM/YYYY" | "YYYY-MM-DD" = "DD/MM/YYYY") {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  if (format === "YYYY-MM-DD") return `${year}-${month}-${day}`;
  return `${day}/${month}/${year}`;
}



/* --------------------------------------------- 🔍 Obtenir une carte par unique_code ------------------------------------------------ */
export async function getCarteByUniqueCode(unique_code: string): Promise<CarteProduction | null> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("unique_code", unique_code)
      .query(`SELECT * FROM employee_details WHERE unique_code = @unique_code`);

    if (result.recordset.length === 0) return null;

    const carte = result.recordset[0] as CarteProduction;

    // Convertir les images
    bufferToBase64Field(carte, "photo");
    bufferToBase64Field(carte, "signature");

    // Formater toutes les dates en JJ-MM-AAAA
    formatDate(carte);

    // Normalisation BIT → booléen
    carte.is_produced = carte.is_produced === true || carte.is_produced === 1;
    carte.is_distributed = carte.is_distributed === true || carte.is_distributed === 1;

    return carte;
  } catch (err) {
    console.error("Erreur getCarteByUniqueCode:", err);
    throw err;
  }
}


export async function getAllCarteProductions({ page, limit, is_distributed, is_produced }: GetCarteParams) {
  try {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    let query = `
      SELECT *
      FROM employee_details
      WHERE 1 = 1
    `;

    if (is_distributed) {
      if (is_distributed === "true") query += " AND is_distributed = 1";
      if (is_distributed === "false") query += " AND is_distributed = 0";
      if (is_distributed === "null") query += " AND is_distributed IS NULL";
    }

    if (is_produced) {
      if (is_produced === "true") query += " AND is_produced = 1";
      if (is_produced === "false") query += " AND is_produced = 0";
      if (is_produced === "null") query += " AND is_produced IS NULL";
    }

    query += `
      ORDER BY id DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const request = pool.request();
    request.input("offset", offset);
    request.input("limit", limit);

    const result = await request.query(query);

    // Count total
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM employee_details
      WHERE 1 = 1
    `;
    if (is_distributed) {
      if (is_distributed === "true") countQuery += " AND is_distributed = 1";
      if (is_distributed === "false") countQuery += " AND is_distributed = 0";
      if (is_distributed === "null") countQuery += " AND is_distributed IS NULL";
    }
    if (is_produced) {
      if (is_produced === "true") countQuery += " AND is_produced = 1";
      if (is_produced === "false") countQuery += " AND is_produced = 0";
      if (is_produced === "null") countQuery += " AND is_produced IS NULL";
    }

    const countResult = await pool.request().query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    const cartes = result.recordset.map((r: any) => {
      bufferToBase64Field(r, "photo");
      bufferToBase64Field(r, "signature");

      // Normalisation BIT → booléen
      r.is_produced = r.is_produced === true || r.is_produced === 1;
      r.is_distributed = r.is_distributed === true || r.is_distributed === 1;

      // Champ calculé
      let status: "pending" | "produced" | "distributed" = "pending";
      let message = "Carte trouvée mais pas encore produite";

      if (r.is_produced && !r.is_distributed) {
        status = "produced";
        message = "Carte produite mais pas encore distribuée";
      } else if (r.is_distributed) {
        status = "distributed";
        message = "Carte produite et distribuée";
      }

      return {
        ...r,
        status,
        message,
      } as CarteProduction;
    });

    return {
      data: cartes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (err) {
    console.error("Erreur getAllCarteProductions:", err);
    throw err;
  }
}


/* --------------------------------------------- ✏️ Mise à jour d’une carte ------------------------------------------------ */
export async function updateCarteByUniqueCode(unique_code: string, data: Partial<CarteProduction>): Promise<{ data: CarteProduction } | null> {
  try {
    const pool = await getConnection();

    const fields = Object.keys(data).map((key) => `${key} = @${key}`).join(", ");
    if (!fields) throw new Error("Aucune donnée à mettre à jour");

    const request = pool.request();
    request.input("unique_code", unique_code);

    for (const [key, value] of Object.entries(data)) {
      request.input(key, value as any);
    }

    const query = `
      UPDATE employee_details
      SET ${fields}
      WHERE unique_code = @unique_code;

      SELECT * FROM employee_details WHERE unique_code = @unique_code;
    `;

    const result = await request.query(query);
    if (result.recordset.length === 0) return null;

    const updated = result.recordset[0];
    bufferToBase64Field(updated, "photo");
    bufferToBase64Field(updated, "signature");

    return { data: updated };
  } catch (err) {
    console.error("Erreur updateCarteByUniqueCode:", err);
    throw err;
  }
}

/* --------------------------------------------- 📸 Mise à jour photo ------------------------------------------------ */
export async function updatePhotoByUniqueCode(unique_code: string, data: { urlphoto: string }): Promise<{ data: CarteProduction } | null> {
  try {
    const pool = await getConnection();
    const request = pool.request();

    request.input("unique_code", unique_code);
    request.input("urlphoto", data.urlphoto);

    const query = `
      UPDATE employee_details
      SET urlphoto = @urlphoto
      WHERE unique_code = @unique_code;

      SELECT * FROM employee_details WHERE unique_code = @unique_code;
    `;

    const result = await request.query(query);
    if (result.recordset.length === 0) return null;

    const updated = result.recordset[0];
    bufferToBase64Field(updated, "photo");
    bufferToBase64Field(updated, "signature");

    return { data: updated };
  } catch (err) {
    console.error("Erreur updatePhotoByUniqueCode:", err);
    throw err;
  }
}

export async function searchCarteProductions(filters: { 
  nom?: string; 
  prenoms?: string; 
  datenaissance?: Date; 
}): Promise<CarteProduction[]> {
  try {
    const pool = await getConnection();
    const request = pool.request();

    const conditions: string[] = [];

    if (filters.nom) {
      conditions.push("last_name COLLATE Latin1_General_CI_AI LIKE @nom");
      request.input("nom", `%${filters.nom}%`);
    }

    if (filters.prenoms) {
      conditions.push("first_name COLLATE Latin1_General_CI_AI LIKE @prenoms");
      request.input("prenoms", `%${filters.prenoms}%`);
    }

    if (filters.datenaissance) {
      conditions.push("CONVERT(date, dob) = @dob");
      request.input("dob", filters.datenaissance);
    }

    let query = "SELECT * FROM employee_details";
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const result = await request.query(query);

    const cartes = result.recordset.map((r: any) => {
      bufferToBase64Field(r, "photo");
      bufferToBase64Field(r, "signature");

      // Normalisation BIT → booléen
      r.is_produced = r.is_produced === true || r.is_produced === 1;
      r.is_distributed = r.is_distributed === true || r.is_distributed === 1;

      // Champ calculé
      if (!r.is_produced) {
        r.status = "pending";
      } else if (r.is_produced && !r.is_distributed) {
        r.status = "produced";
      } else if (r.is_distributed) {
        r.status = "distributed";
      }

      return r as CarteProduction;
    });

    return cartes;
  } catch (err) {
    console.error("Erreur searchCarteProductions:", err);
    throw err;
  }
}


/* --------------------------------------------- 📊 Statistiques sur les cartes ------------------------------------------------ */
export async function getCarteStatistics() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT
        COUNT(*) AS total_cartes,
        SUM(CASE WHEN is_produced = 1 THEN 1 ELSE 0 END) AS total_produites,
        SUM(CASE WHEN is_distributed = 1 THEN 1 ELSE 0 END) AS total_distribuees,
        SUM(CASE WHEN is_produced = 0 OR is_produced IS NULL THEN 1 ELSE 0 END) AS total_en_attente,
        SUM(CASE WHEN is_produced = 1 AND (is_distributed = 0 OR is_distributed IS NULL) THEN 1 ELSE 0 END) AS produites_non_distribuees
      FROM employee_details;
    `);

    const stats = result.recordset[0];

    return {
      success: true,
      data: {
        total_cartes: stats.total_cartes || 0,
        total_produites: stats.total_produites || 0,
        total_distribuees: stats.total_distribuees || 0,
        total_en_attente: stats.total_en_attente || 0,
        produites_non_distribuees: stats.produites_non_distribuees || 0,
      },
    };
  } catch (err) {
    console.error("Erreur getCarteStatistics:", err);
    throw err;
  }
}
