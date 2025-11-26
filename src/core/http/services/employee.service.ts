import { getConnection } from "../../db/db";
export interface EmployeeDetails {
  id: number;
  unique_code: string;
  last_name?: string;
  first_name?: string;
  maiden_name?: string;
  sur_name?: string;
  nickname?: string;
  dob?: Date;
  place_of_birth?: string;
  fathers_name?: string;
  fathers_dob?: Date;
  mother_firstname?: string;
  mothers_name?: string;
  mothers_dob?: Date;
  gender_id?: number;
  locality_id?: number;
  locality_of_origin?: string;
  identity_doc_type_id?: number;
  identity_doc_number?: string;
  identity_established_by?: string;
  identity_established_date?: Date;
  phone_no?: string;
  profession_id?: number;
  other_profession?: string;
  is_transfert_to_ics?: boolean;
  date_time?: Date;
  is_active?: boolean;
  is_card_issued?: boolean;
  issuing_date_time?: Date;
  is_data_complete?: boolean;
  is_blocked?: boolean;
  synch_delivery_status?: boolean;
  validation_status?: boolean;
  edit_status?: boolean;
  synch_tried?: boolean;
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
  village_city_birth?: string;
  commune_id?: number;
  collection_point_id?: number;
  pin_number?: string;
  administrative_number?: string;
  diplomatic_mission_number?: string;
  current_validation_status_id?: number;
  current_validation_comment?: string;
  contact_person?: string;
  contact_person_firstname?: string;
  contact_person_phone?: string;
  contact_person_address?: string;
  village?: string;
  location_of_enrolment?: string;
  location_of_enrolment_id?: number;
  old_receipt_no?: string;
  
}


/**
 * Met à jour un employé par unique_code
 */
export async function updateEmployeeByUniqueCode(
  unique_code: string,
  data: Partial<EmployeeDetails>
): Promise<EmployeeDetails | null> {
  try {
    const pool = await getConnection();

    // Construction dynamique des colonnes à mettre à jour
    const fields = Object.keys(data)
      .map((key) => `${key} = @${key}`)
      .join(", ");

    if (!fields) {
      throw new Error("Aucune donnée à mettre à jour");
    }

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

    if (result.recordset.length > 0) {
      return result.recordset[0];
    }

    return null;
  } catch (err) {
    console.error("Erreur updateEmployeeByUniqueCode:", err);
    throw err;
  }
}
