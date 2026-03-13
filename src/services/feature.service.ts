import { FEATURES } from "../utils/config/features.config";
import { schoolFeatures } from "../utils/config/school_features";

const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  const schoolFeature = schoolFeatures[feature];

  if (!schoolFeature) return false;

  if (typeof schoolFeature === "boolean") {
    return schoolFeature;
  }

  return schoolFeature.enabled === true;
};

const validateFeatureDependencies = (
  feature: keyof typeof FEATURES
) => {
  const dependencies = FEATURES[feature].dependencies;

  for (const dep of dependencies) {
    if (!isFeatureEnabled(dep as keyof typeof FEATURES)) {
      throw new Error(
        `${FEATURES[feature].name} requires ${FEATURES[dep].name}`
      );
    }
  }
};


export { isFeatureEnabled, validateFeatureDependencies };

