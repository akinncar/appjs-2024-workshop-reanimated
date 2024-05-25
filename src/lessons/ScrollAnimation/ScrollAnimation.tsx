import { ContactsListHeader } from "@/components/ContactsListHeader";
import { ContactsListItem } from "@/components/ContactsListItem";
import { Container } from "@/components/Container";
import { alphabet, contacts } from "@/lib/mock";
import { hitSlop } from "@/lib/reanimated";
import { colorShades, layout } from "@/lib/theme";
import { useMemo, useRef } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  MeasuredDimensions,
  clamp,
  interpolate,
  measure,
  runOnJS,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import sectionListGetItemLayout from "react-native-section-list-get-item-layout";

type AlphabetLetterProps = {
  index: number;
  letter: string;
  roundedScrollValue: any;
};

const AlphabetLetter = ({
  index,
  letter,
  roundedScrollValue,
}: AlphabetLetterProps) => {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        roundedScrollValue.value,
        [index - 1, index, index + 1],
        [0.5, 1, 0.5],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          scale: interpolate(
            roundedScrollValue.value,
            [index - 2, index, index + 2],
            [1, 1.5, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        },
        animatedStyles,
      ]}
    >
      <Animated.Text
        style={[
          {
            position: "absolute",
            fontFamily: "Menlo",
            left: -20,
            fontWeight: "900",
          },
        ]}
      >
        {letter.toUpperCase()}
      </Animated.Text>
    </Animated.View>
  );
};

export function ScrollAnimationLesson() {
  const y = useSharedValue(0);
  const isInteracting = useSharedValue(false);
  const knobScale = useDerivedValue(() => {
    return withSpring(isInteracting.value ? 1 : 0);
  });

  const alphabetRef = useAnimatedRef();
  const scrollListRef = useRef<SectionList>(null);

  const activeIndex = useSharedValue(0);
  const roundedScrollValue = useSharedValue(0);

  const getItemLayout = useMemo(() => {
    return sectionListGetItemLayout({
      getItemHeight: () => layout.contactListItemHeight,
      getSectionHeaderHeight: () => layout.contactListSectionHeaderHeight,
    });
  }, []);

  const snapIndicatorTo = (index: number) => {
    runOnUI(() => {
      "worklet";

      if (roundedScrollValue.value === index || isInteracting.value) {
        return;
      }

      const alphabetLayout: MeasuredDimensions = measure(alphabetRef);

      if (!alphabetLayout) {
        return;
      }

      const snapBy =
        (alphabetLayout.height - layout.knobSize) / (alphabet.length - 1);
      const snapTo = index * snapBy;
      y.value = withTiming(snapTo);
      roundedScrollValue.value = withTiming(index);
    })();
  };

  const scrollToLocation = (index: number) => {
    scrollListRef.current?.scrollToLocation({
      itemIndex: 0,
      sectionIndex: index,
      animated: false,
    });
  };

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      isInteracting.value = true;
    })
    .onChange((ev) => {
      // take into account the knob size
      y.value += ev.changeY;

      const alphabetLayout: MeasuredDimensions = measure(alphabetRef);

      y.value = clamp(
        (y.value += ev.changeY),
        alphabetLayout.y,
        alphabetLayout.height - layout.knobSize
      );

      const snapBy =
        (alphabetLayout.height - layout.knobSize) / (alphabet.length - 1);

      roundedScrollValue.value = y.value / snapBy;
      const snapToIndex = Math.round(roundedScrollValue.value);

      // Ensure that we don't trigger scroll to the same index.
      if (snapToIndex === activeIndex.value) {
        return;
      }

      activeIndex.value = snapToIndex;

      runOnJS(scrollToLocation)(snapToIndex);
    })
    .onEnd(() => {
      y.value = withSpring(0);
      runOnJS(snapIndicatorTo)(activeIndex.value);
    })
    .onFinalize(() => {
      isInteracting.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderWidth: interpolate(
        knobScale.value,
        [0, 1],
        [layout.knobSize / 2, 2],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: y.value,
        },
        {
          scale: knobScale.value + 1,
        },
      ],
    };
  });

  return (
    <Container centered={false}>
      <View style={{ flex: 1 }}>
        <SectionList
          contentContainerStyle={{ paddingHorizontal: layout.spacing * 2 }}
          stickySectionHeadersEnabled={false}
          // @ts-ignore
          getItemLayout={getItemLayout}
          sections={contacts}
          renderSectionHeader={({ section: { title } }) => {
            return <ContactsListHeader title={title} />;
          }}
          renderItem={({ item }) => {
            return <ContactsListItem item={item} />;
          }}
          ref={scrollListRef}
          onViewableItemsChanged={({ viewableItems }) => {
            const middleElementIndex = viewableItems.length / 2;
            const item = viewableItems[middleElementIndex];
            if (viewableItems[0].index === 0) {
              snapIndicatorTo(0);
            }
            if (item?.section) {
              const indexToScroll = item.section.index;
              snapIndicatorTo(indexToScroll);
            }
          }}
        />
        <View
          style={{
            position: "absolute",
            right: 0,
            top: layout.indicatorSize,
            bottom: layout.indicatorSize,
          }}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[styles.knob, animatedStyle]}
              hitSlop={hitSlop}
            />
          </GestureDetector>
          <View
            style={{
              transform: [{ translateX: -layout.indicatorSize / 4 }],
              flex: 1,
              width: 20,
              justifyContent: "space-around",
            }}
            ref={alphabetRef}
            pointerEvents="box-none"
          >
            {[...Array(alphabet.length).keys()].map((i) => {
              return (
                <AlphabetLetter
                  key={i}
                  letter={alphabet.charAt(i)}
                  index={i}
                  roundedScrollValue={roundedScrollValue}
                />
              );
            })}
          </View>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  knob: {
    width: layout.knobSize,
    height: layout.knobSize,
    borderRadius: layout.knobSize / 2,
    backgroundColor: "#fff",
    borderWidth: layout.knobSize / 2,
    borderColor: colorShades.purple.base,
    position: "absolute",
    left: -layout.knobSize / 2,
  },
});
