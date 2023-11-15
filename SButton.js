import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  Image,
  View,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function SButton(props) {
  const {onPress, title = 'Save'} = props;
  let buttonStyle = styles.button;
  let textStyle = styles.text;
  let gradientColor = ['#ffd60a', '#ffa203'];
  let txtColor = '#000000';
  let img = <View />;

  if (props.btnStyle === 'success') {
    buttonStyle = styles.buttonSuccess;
    img = (
      <Image
        source={require('./assets/success.png')}
        style={{position: 'absolute', right: 15, width: 50, height: 50}}
      />
    );
    gradientColor = ['#8eff47', '#5dbd22'];
    txtColor = '#FFFFFF';
  } else if (props.btnStyle === 'failure') {
    buttonStyle = styles.buttonFailure;
    img = (
      <Image
        source={require('./assets/failure.png')}
        style={{position: 'absolute', right: 15, width: 50, height: 50}}
      />
    );
    gradientColor = ['#bd222a', '#ff4751'];
    txtColor = '#FFFFFF';
  } else if (props.btnStyle === 'working') {
    buttonStyle = styles.buttonWorking;
    gradientColor = ['#CCCCCC', '#CCCCCC'];
    txtColor = '#FFFFFF';
  }

  return (
    <LinearGradient
      colors={gradientColor}
      style={styles.gradientBtn}
      locations={[0.23, 0.51, 0.74]}
      useAngle={true}
      angle={125.9}
      h>
      <TouchableOpacity
        onPress={!props.disabled ? onPress : () => {}}
        style={styles.button}>
        <Text style={[textStyle, {color: txtColor}]}>{title}</Text>
        {img}
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBtn: {
    borderRadius: 50,

    // backgroundColor: '#DCB54C',
    height: 60,
  },

  button: {
    // padding: 24,
    height: '100%',
    elevation: 3,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWorking: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    elevation: 3,
    // padding: 24,
    height: '100%',
    backgroundColor: '#CCCCCC',
  },
  buttonSuccess: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    elevation: 3,
    // padding: 24,
    height: '100%',
    backgroundColor: '#22E372',
  },
  buttonFailure: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    elevation: 3,
    // padding: 24,
    height: '100%',
    backgroundColor: '#E32234',
  },
  text: {
    fontSize: 20,
    // fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});
