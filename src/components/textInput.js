import React from "react";
import { TextInput } from "react-native";
import propTypes from "prop-types";
import { COLORS } from "../constants/colors";
const CustomTextInput = (props) => {
  return (
    <TextInput
      secureTextEntry={props.secureTextEntry}
      onChangeText={props.onChangeText}
      value={props.value}
      style={[props.style, { ...props.customStyle }]}
      editable={props.editable}
      placeholder={props.placeholder}
    />
  );
};
export default CustomTextInput;

CustomTextInput.propTypes = {
  secureTextEntry: propTypes.bool,
  onChangeText: propTypes.func,
  value: propTypes.string,
  editable: propTypes.bool,
  placeholder: propTypes.string,
  style: propTypes.object,
  customStyle: propTypes.object,
};
CustomTextInput.defaultProps = {
  placeholder: "",
  editable: true,
  value: "",
  onChangeText: (e) => console.log(e),
  secureTextEntry: false,
  style: {
    backgroundColor: COLORS.white,
    color: COLORS.black,
    borderRadius: 4,
    elevation: 3,
    borderColor: COLORS.black,
    fontSize: 16,
    paddingHorizontal: 10,
    height: 50,
  },
  customStyle: {},
};
