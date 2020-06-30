import React from 'react';
import Gallery, { PhotoProps } from 'react-photo-gallery'
import './App.css';

export interface PhotosProps { photos: Array<PhotoProps>}
class Photos extends React.Component<PhotosProps>{
  constructor(props: PhotosProps){             
    super(props);                 
    this.state = { currentImage: 0 }; 
  }

  shouldComponentUpdate(nextProps: PhotosProps) {
    return this.props.photos.length !== nextProps.photos.length;
  }

  render(){
    return(
      <div>
        <Gallery photos={this.props.photos} />
      </div>
    )
  }
}
export default Photos;
