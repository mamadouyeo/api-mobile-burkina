import { Request, Response } from "express";
import { updateEmployeeByUniqueCode } from "../services/employee.service";

export async function transferEmployeeToICS(req: Request, res: Response) {
  const { unique_code } = req.params;

  if (!unique_code) {
    return res.status(400).json({ message: "Le paramètre unique_code est requis" });
  }

  try {
    const data = {
      is_transfert_to_ics: true,
    };

    const employee = await updateEmployeeByUniqueCode(unique_code, data);

    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    res.json({
      message: "Employé transféré vers ICS",
      employee,
    });
  } catch (err) {
    console.error("Erreur transferEmployeeToICS:", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
}
