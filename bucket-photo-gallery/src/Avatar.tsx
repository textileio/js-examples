import React from 'react';
// @ts-ignore
import Jdenticon from 'react-jdenticon';
import './App.css';

export interface AvatarProps { identity: string }
class Avatar extends React.Component<AvatarProps>{

  render(){
    return(
      <Jdenticon size="48" value={this.props.identity} />
    )
  }
}
export default Avatar;
