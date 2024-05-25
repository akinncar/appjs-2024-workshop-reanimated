import { AnimatedText } from "@/components/AnimatedText";
import { Container } from "@/components/Container";
import { hitSlop } from "@/lib/reanimated";
import { colorShades, layout } from "@/lib/theme";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  clamp,
  interpolate,
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export function BalloonSliderLesson() {
  const x = useSharedValue(0);
  const knobScale = useSharedValue(0);
  const balloonScale = useSharedValue(0);
  const progress = useSharedValue(0);

  const aRef = useAnimatedRef();

  const balloonSpringX = useDerivedValue(() => {
    return withSpring(x.value);
  });

  const tapGesture = Gesture.Tap()
    .maxDuration(100000)
    .onBegin(() => {
      balloonScale.value = withSpring(1);
    });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onStart(() => {
      knobScale.value = withSpring(1);
    })
    .onChange((ev) => {
      const size = measure(aRef);
      progress.value = 100 * (x.value / size.width);
      x.value = clamp((x.value += ev.changeX), 0, size.width);
    })
    .onEnd(() => {
      knobScale.value = withSpring(0);
      balloonScale.value = withSpring(0);
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
          translateX: x.value,
        },
        {
          scale: knobScale.value + 1,
        },
      ],
    };
  });

  const balloonStyle = useAnimatedStyle(() => {
    return {
      opacity: balloonScale.value,
      transform: [
        { translateX: balloonSpringyX.value },
        { scale: balloonScale.value },
        {
          translateY: interpolate(
            balloonScale.value,
            [0, 1],
            [0, -layout.indicatorSize]
          ),
        },
        {
          rotate: `${Math.atan2(
            balloonSpringX.value - x.value,
            layout.indicatorSize * 2
          )}rad`,
        },
      ],
    };
  });

  const gestures = Gesture.Simultaneous(tapGesture, panGesture);

  return (
    <Container>
      <GestureDetector gesture={gestures}>
        <View style={styles.slider} ref={aRef}>
          <Animated.View style={[styles.balloon, balloonStyle]}>
            <View style={styles.textContainer}>
              <AnimatedText
                text={progress}
                style={{ color: "white", fontWeight: "600" }}
              />
            </View>
          </Animated.View>
          <Animated.View
            style={[styles.knob, animatedStyle]}
            hitSlop={hitSlop}
          />
          <Animated.View style={[styles.progress, { width: x }]} />
        </View>
      </GestureDetector>
    </Container>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: "80%",
    height: 5,
    justifyContent: "center",
    backgroundColor: colorShades.purple.light,
    zIndex: 0,
  },
  progress: {
    width: "80%",
    height: 5,
    backgroundColor: colorShades.purple.dark,
    position: "absolute",
  },
  knob: {
    width: layout.knobSize,
    height: layout.knobSize,
    borderRadius: layout.knobSize / 2,
    backgroundColor: "#fff",
    borderWidth: layout.knobSize / 2,
    borderColor: colorShades.purple.base,
    position: "absolute",
    left: -layout.knobSize / 2,
    zIndex: 1,
  },
  textContainer: {
    width: 40,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorShades.purple.base,
    position: "absolute",
    top: -layout.knobSize,
  },
  balloon: {
    alignItems: "center",
    justifyContent: "center",
    width: 4,
    height: layout.indicatorSize,
    bottom: -layout.knobSize / 2,
    borderRadius: 2,
    backgroundColor: colorShades.purple.base,
    position: "absolute",
  },
});
