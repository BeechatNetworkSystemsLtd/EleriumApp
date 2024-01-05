import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundColor,
    flex: 1,
  },
  contentContainer: {
    padding: 30,
  },
  descriptiveTxt: {
    color: COLORS.white,
  },
  inputLabel: { paddingTop: 15, paddingBottom: 15, color: COLORS.white },
  btnContainer: {
    paddingTop: 15,
  },
  label: {
    fontSize: 24,
    color: COLORS.white,
  },
});

export default styles;
