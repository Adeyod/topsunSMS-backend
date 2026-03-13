import { NextFunction, Request, Response } from "express";
import { FeatureEnum } from "../constants/enum";
import { isFeatureEnabled, validateFeatureDependencies } from "../services/feature.service";

 const requireFeature = (features: FeatureEnum | FeatureEnum[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const featureList = Array.isArray(features) ? features : [features];

    for (const feature of featureList) {
      if (!isFeatureEnabled(feature)) {
        res.status(403).json({ message: `${feature} is disabled` });
        return
      }

      try {
        validateFeatureDependencies(feature);
      } catch (err: any) {
        res.status(403).json({ message: err.message });
        return
      }
    }

    next();
  };
};

export { requireFeature };

