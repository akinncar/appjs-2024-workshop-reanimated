import { Container } from "@/components/Container";
import { hitSlop } from "@/lib/reanimated";
import { colorShades, layout } from "@/lib/theme";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export function CircleGesturesLesson() {
  const knobSize = useSharedValue(1);
  const x = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      knobSize.value = withSpring(2);
    })
    .onFinalize(() => {
      knobSize.value = withSpring(1);
    });

  const pan = Gesture.Pan()
    .onChange((value) => {
      x.value += value.changeX;
    })
    .onFinalize(() => {
      x.value = 1;
    });

  const combined = Gesture.Simultaneous(tap, pan);

  const animatedKnobStyle = useAnimatedStyle(() => {
    const nextKnobSize = 50;

    return {
      width: interpolate(
        knobSize.value,
        [1, 2],
        [layout.knobSize, nextKnobSize]
      ),
      height: interpolate(
        knobSize.value,
        [1, 2],
        [layout.knobSize, nextKnobSize]
      ),
      borderRadius: interpolate(
        knobSize.value,
        [1, 2],
        [layout.knobSize / 2, nextKnobSize / 2]
      ),
      borderWidth: interpolate(
        knobSize.value,
        [1, 2],
        [layout.knobSize / 2, 2],
        Extrapolation.CLAMP
      ),
      left: interpolate(
        knobSize.value,
        [1, 2],
        [-layout.knobSize / 2, -nextKnobSize / 2],
        Extrapolation.CLAMP
      ),

      transform: [
        {
          translateX: x.value,
        },
        {
          scale: knobSize.value,
        },
      ],
    };
  });

  return (
    <Container>
      <GestureDetector gesture={combined}>
        <Animated.View style={{ flex: 1, justifyContent: "center" }}>
          <Animated.View
            style={[styles.knob, animatedKnobStyle]}
            hitSlop={hitSlop}
          />
        </Animated.View>
      </GestureDetector>
    </Container>
  );
}

const styles = StyleSheet.create({
  knob: {
    backgroundColor: "#fff",
    borderColor: colorShades.purple.base,
    position: "absolute",
  },
});
