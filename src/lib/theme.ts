import { Dimensions } from "react-native";

const { width } = Dimensions.get("screen");

const moreItems = false; // Set to true to see more items when doing the interpolation lesson

export const layout = {
  spacing: 8,
  radius: 8,
  knobSize: 24,
  indicatorSize: 48,
  avatarSize: 36,
  imageHeight: 260,
  contactListItemHeight: 36 + 8 * 2, // layout.avatarSize + layout.spacing * 2
  contactListSectionHeaderHeight: 50,
  // Interpolation
  itemSize: moreItems ? width * 0.25 : width * 0.75,
  screenWidth: width,
};

export const colors = {
  purple: "#683FC2",
  blue: "#007AFF",
  green: "#34C759",
  primary: "#001A72",
  accent: "#782AEB",
  overlay: "rgba(98, 98, 98, 0.6)",
  border: "#C1C6E5",
};

type ColorShades = {
  [key in keyof typeof colors]: {
    base: string;
    light: string;
    dark: string;
  };
};

export const colorShades: ColorShades = Object.entries(colors).reduce(
  (acc, [key, value]) => {
    acc[key as keyof typeof colors] = {
      base: value,
      light: `${value}55`,
      dark: `${value}DD`,
    };
    return acc;
  },
  {} as ColorShades
);
