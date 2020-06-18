import { StyleSheet } from 'react-native'

const values = {
  fontPlaceSize: 14,
  fontTimeSize: 10,
  smallIconSize: 30,
  fontTempSize: 12,
}

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
  rowCellTimeplace: {
    flex: 1,
    flexDirection: 'column',
  },
  rowCellTemp: {
    color: '#777',
    paddingHorizontal: 16,
    flex: 0,
    fontSize: values.fontTempSize,
  },
  rowTime: {
    color: '#777',
    textAlignVertical: 'bottom',
    includeFontPadding: false,
    flex: 0,
    fontSize: values.fontTimeSize,
  },
  rowName: {
    color: '#333',
    textAlignVertical: 'top',
    includeFontPadding: false,
    flex: 0,
    fontSize: values.fontPlaceSize,
  },
  error: {
    color: '#333',
    flex: 0,
    paddingTop: 24,
    textAlign: 'center',
    fontSize: values.fontPlaceSize,
  },
})

export default styles
