import {
  StyleSheet,
} from 'react-native';

const values = {
  font_place_size: 14,
  font_time_size: 10,
  small_icon_size: 30,
  font_temp_size: 12,
};

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    alignSelf: 'stretch',
  },
  list: {
    margin: 0,
    alignSelf: 'stretch',
  },
  row: {
    elevation: 1,
    borderRadius: 2,
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row', // main axis
    justifyContent: 'flex-start', // main axis
    alignItems: 'center', // cross axis
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 18,
    paddingRight: 16,
    marginLeft: 14,
    marginRight: 14,
    marginTop: 0,
    marginBottom: 6,
  },
  row_cell_timeplace: {
    flex: 1,
    flexDirection: 'column',
  },
  row_cell_temp: {
    color: '#777',
    paddingHorizontal: 16,
    flex: 0,
    fontSize: values.font_temp_size,
  },
  row_time: {
    color: '#777',
    textAlignVertical: 'bottom',
    includeFontPadding: false,
    flex: 0,
    fontSize: values.font_time_size,
  },
  row_name: {
    color: '#333',
    textAlignVertical: 'top',
    includeFontPadding: false,
    flex: 0,
    fontSize: values.font_place_size,
  },
  error: {
    color: '#333',
    flex: 0,
    paddingTop: 24,
    textAlign: 'center',
    fontSize: values.font_place_size,
  },
});

export default styles;
