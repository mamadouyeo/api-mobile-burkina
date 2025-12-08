import { Request, Response } from "express";
import {
  getCarteByUniqueCode,
  updateCarteByUniqueCode,
  CarteProduction,
  searchCarteProductions,
  getAllCarteProductions,
  updatePhotoByUniqueCode,
  getCarteStatistics
} from "../services/production.service";

/** GET /api/carteproductions */
export async function getAllCarteProductionsController(req: Request, res: Response) {
  try {
    const { page = "1", limit = "10", is_distributed, is_produced } = req.query;
    const cartes = await getAllCarteProductions({
      page: Number(page),
      limit: Number(limit),
      is_distributed: is_distributed as string | undefined,
      is_produced: is_produced as string | undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Liste des cartes récupérée avec succès",
      data: cartes.data,
      pagination: cartes.pagination,
    });
  } catch (err) {
    console.error("Erreur controller getAllCarteProductions:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des cartes",
      error: err,
    });
  }
}

/** PUT /api/carteproductions/distribute/:unique_code */
export async function distributeCarte(req: Request, res: Response) {
  const { unique_code } = req.params;
  if (!unique_code) {
    return res.status(400).json({ success: false, message: "Le paramètre unique_code est requis" });
  }
  try {
    const carte = await getCarteByUniqueCode(unique_code);
    if (!carte) {
      return res.status(404).json({ success: false, message: "Carte non trouvée, veuillez vérifier le code unique fourni" });
    }
    if (!carte.is_produced) {
      return res.status(400).json({ success: false, message: "Impossible de distribuer : la carte n'est pas encore produite" });
    }
    if (carte.is_distributed) {
      return res.status(400).json({ success: false, message: "Carte déjà distribuée" });
    }

    const data: Partial<CarteProduction> = {
      is_distributed: true,
      distribution_date: new Date(),
    };
    const updatedCarte = await updateCarteByUniqueCode(unique_code, data);

    return res.status(200).json({
      success: true,
      message: "Carte distribuée avec succès",
      data: updatedCarte,
    });
  } catch (err) {
    console.error("Erreur controller distributeCarte:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la distribution", error: err });
  }
}

/** GET /api/carteproductions/search */
export async function searchCarte(req: Request, res: Response) {
  try {
    const { nom, prenoms, datenaissance } = req.query;
    const cartes = await searchCarteProductions({
      nom: nom as string,
      prenoms: prenoms as string,
      datenaissance: datenaissance ? new Date(datenaissance as string) : undefined,
    });

    if (!cartes || cartes.length === 0) {
      return res.status(404).json({
        success: false,
        status: "not_found",
        message: "Aucune carte correspondant aux critères, veuillez vérifier les informations fournies",
      });
    }

    // Enrichir chaque carte avec un statut et un message basé sur is_produced / is_distributed
    const cartesAvecStatus = cartes.map((carte) => {
      let status: "pending" | "produced" | "distributed" = "pending";
      let message = "Carte trouvée mais pas encore produite";

      if (carte.is_produced && !carte.is_distributed) {
        status = "produced";
        message = "Carte produite mais pas encore distribuée";
      } else if (carte.is_distributed) {
        status = "distributed";
        message = "Carte produite et distribuée";
      }

      return {
        ...carte,
        status,
        message,
      };
    });

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Résultats de la recherche",
      data: cartesAvecStatus,
    });
  } catch (err) {
    console.error("Erreur searchCarte:", err);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Erreur serveur lors de la recherche",
      error: err,
    });
  }
}


export const updateCartePhoto = async (req: Request, res: Response) => {
  try {
    const { unique_code } = req.params;

    // Déterminer la source de la photo
    let urlphoto: string | null = null;
    if (req.file) {
      urlphoto = `/uploads/${req.file.filename}`;
    } else if (req.body?.urlphoto) {
      urlphoto = req.body.urlphoto;
    }

    // Vérification des données
    if (!urlphoto) {
      return res.status(400).json({
        success: false,
        status: "invalid",
        message: "Aucune photo ou URL fournie",
      });
    }

    // Mise à jour en base
    const updated = await updatePhotoByUniqueCode(unique_code, { urlphoto });

    if (!updated) {
      return res.status(404).json({
        success: false,
        status: "not_found",
        message: "Carte non trouvée",
      });
    }

    // Succès
    return res.status(200).json({
      success: true,
      status: "updated",
      message: "Photo mise à jour avec succès",
      data: {
        ...updated.data,
        photoUrl: `${process.env.BASE_URL}${urlphoto}`,
      },
    });
  } catch (error) {
    console.error("Erreur updateCartePhoto:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Erreur serveur lors de la mise à jour de la photo",
      error,
    });
  }
};


/** GET /api/v1/idcapture/carte/:unique_code */
export const getCarte = async (req: Request, res: Response) => {
  try {
    const { unique_code } = req.params;
    const carte = await getCarteByUniqueCode(unique_code);

    if (!carte) {
      return res.status(404).json({ success: false, message: "Carte non trouvée, veuillez vérifier le code unique" });
    }

    // Logique métier basée sur is_produced / is_distributed
    if (!carte.is_produced) {
      return res.status(409).json({ success: false, message: "Carte trouvée mais pas encore produite" });
    }

    if (carte.is_produced && !carte.is_distributed) {
      return res.status(200).json({ success: true, status: "produced", message: "Carte produite mais pas encore distribuée", data: carte });
    }

    if (carte.is_distributed) {
      return res.status(200).json({ success: true, status: "distributed", message: "Carte produite et distribuée", data: carte });
    }

    return res.status(200).json({ success: true, status: "retrieved", message: "Carte récupérée avec succès", data: carte });
  } catch (err) {
    console.error("Erreur getCarte:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération de la carte", error: err });
  }
};

/** PUT /api/v1/idcapture/carte/:unique_code */
export const updateCarteByUniqueCodes = async (req: Request, res: Response) => {
  try {
    const { unique_code } = req.params;
    const updateData = req.body;

    if (!unique_code) {
      return res.status(400).json({ success: false, message: "Le paramètre unique_code est requis" });
    }

    const updatedCarte = await updateCarteByUniqueCode(unique_code, updateData);

    if (!updatedCarte) {
      return res.status(404).json({ success: false, message: "Carte non trouvée" });
    }

    return res.status(200).json({
      success: true,
      message: "Carte mise à jour avec succès",
      data: updatedCarte,
    });
  } catch (err) {
    console.error("Erreur updateCarteController:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour", error: err });
  }
};
/** GET /api/carteproductions/statistics */
export const getCarteStatisticsController = async (req: Request, res: Response) => {
  try {
    const stats = await getCarteStatistics();

    return res.status(200).json({
      success: true,
      message: "Statistiques récupérées avec succès",
      data: stats.data,
    });

  } catch (error) {
    console.error("Erreur controller getCarteStatistics:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des statistiques",
      error,
    });
  }
};
