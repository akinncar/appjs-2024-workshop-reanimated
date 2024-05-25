import { Container } from "@/components/Container";
import { tabsList } from "@/lib/mock";
import { hitSlop } from "@/lib/reanimated";
import { colorShades, layout } from "@/lib/theme";
import React, { memo, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  MeasuredDimensions,
  measure,
  runOnJS,
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type TabsProps = {
  name: string;
  isActiveTabIndex: boolean;
  onReceiveMeasure: any;
  scrollToTab: any;
};

const Tab = memo(
  ({ name, isActiveTabIndex, onReceiveMeasure, scrollToTab }: TabsProps) => {
    const animatedRef = useAnimatedRef();

    const handleMeasure = () => {
      runOnUI(() => {
        const measurements = measure(animatedRef);
        runOnJS(onReceiveMeasure)(measurements);
      })();
    };

    useEffect(() => {
      if (isActiveTabIndex) {
        handleMeasure();
      }
    }, [isActiveTabIndex]);

    const handlePress = () => {
      handleMeasure();
      scrollToTab();
    };

    return (
      <View style={styles.tab} ref={animatedRef}>
        <TouchableOpacity
          hitSlop={hitSlop}
          style={{ marginHorizontal: layout.spacing }}
          onLayout={() => {
            // This is needed because we can't send the initial render measurements
            // without hooking into `onLayout`.
            if (isActiveTabIndex) {
              handleMeasure();
            }
          }}
          onPress={handlePress}
        >
          <Text>{name}</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

// This component should receive the selected tab measurements as props
function Indicator({ tabMeasurements }) {
  const tabAnimatedStyles = useAnimatedStyle(() => {
    if (!tabMeasurements?.value) return {};

    const { x, width } = tabMeasurements.value;

    return {
      left: withTiming(x),
      width: withTiming(width),
    };
  });

  return <Animated.View style={[styles.indicator, tabAnimatedStyles]} />;
}
export function DynamicTabsLesson({
  selectedTabIndex = 0,
  onChangeTab,
}: {
  selectedTabIndex?: number;
  // Call this function when the tab changes
  // Don't forget to check if the function exists before calling it
  onChangeTab?: (index: number) => void;
}) {
  const scrollViewRef = useAnimatedRef();

  const tabMeasurements = useSharedValue(0);

  function onReceiveMeasure(value) {
    tabMeasurements.value = value;
  }

  const scrollToTab = (index) => {
    runOnUI(() => {
      "worklet";

      const scrollViewDimensions: MeasuredDimensions = measure(scrollViewRef);

      if (!scrollViewDimensions || !tabMeasurements.value) {
        return;
      }

      scrollTo(
        scrollViewRef,
        tabMeasurements.value.x -
          // this is how to place the item in the middle
          (scrollViewDimensions.width - tabMeasurements.value.width) / 2,
        0,
        true
      );

      if (onChangeTab) {
        runOnJS(onChangeTab)(index);
      }
    })();
  };

  return (
    <Container>
      <ScrollView
        horizontal
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.scrollViewContainer}
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
      >
        {tabsList.map((tab, index) => (
          <Tab
            key={`tab-${tab}-${index}`}
            name={tab}
            isActiveTabIndex={index === selectedTabIndex}
            onReceiveMeasure={onReceiveMeasure}
            scrollToTab={() => scrollToTab(index)}
          />
        ))}
        <Indicator tabMeasurements={tabMeasurements} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: "absolute",
    backgroundColor: colorShades.purple.base,
    height: 4,
    borderRadius: 2,
    bottom: 0,
    left: 0,
    width: 100,
  },
  tab: {
    marginHorizontal: layout.spacing,
  },
  scrollViewContainer: {
    paddingVertical: layout.spacing * 2,
  },
});
