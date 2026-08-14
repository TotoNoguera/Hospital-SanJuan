import {
  Activity,
  Apple,
  Baby,
  Bone,
  Droplet,
  Dna,
  Dumbbell,
  Ear,
  FlaskConical,
  Flower,
  HandHeart,
  HeartPulse,
  Microscope,
  Radiation,
  Scan,
  Shield,
  Sparkles,
  Stethoscope,
  Wind,
} from "lucide-react";

export const SPECIALTY_ICON_NAMES = [
  "activity",
  "apple",
  "baby",
  "bone",
  "droplet",
  "dna",
  "dumbbell",
  "ear",
  "flask-conical",
  "flower",
  "hand-heart",
  "heart-pulse",
  "microscope",
  "radiation",
  "scan",
  "shield",
  "sparkles",
  "stethoscope",
  "wind",
];

/**
 * Cada rama devuelve un ícono importado directamente (no una referencia calculada
 * en tiempo de render) para no chocar con la regla react-hooks/static-components.
 */
export function SpecialtyIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "activity":
      return <Activity className={className} />;
    case "apple":
      return <Apple className={className} />;
    case "baby":
      return <Baby className={className} />;
    case "bone":
      return <Bone className={className} />;
    case "droplet":
      return <Droplet className={className} />;
    case "dna":
      return <Dna className={className} />;
    case "dumbbell":
      return <Dumbbell className={className} />;
    case "ear":
      return <Ear className={className} />;
    case "flask-conical":
      return <FlaskConical className={className} />;
    case "flower":
      return <Flower className={className} />;
    case "hand-heart":
      return <HandHeart className={className} />;
    case "heart-pulse":
      return <HeartPulse className={className} />;
    case "microscope":
      return <Microscope className={className} />;
    case "radiation":
      return <Radiation className={className} />;
    case "scan":
      return <Scan className={className} />;
    case "shield":
      return <Shield className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    case "wind":
      return <Wind className={className} />;
    case "stethoscope":
    default:
      return <Stethoscope className={className} />;
  }
}
