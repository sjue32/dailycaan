import React from 'react';
import { ImagePostTextProps } from '../../types';
import smileyFace from '../images/icons8-savouring-delicious-food-face-48.png';

const ImagePostText = (props: ImagePostTextProps) => {

  const { username, timestamp, caption, likes } = props;

  const imgDate = new Date(Number(timestamp));
  const dateString = imgDate.toLocaleDateString();

  return(
    <div className='imagePostTextGroup'>
      <div className='imagePostTextTopRow'>
        <strong>{username}</strong>
        <div className="imagePostTextTopRowCenter">
          <img className='likesIcon' src={smileyFace} alt='a smiley face'/>
          &nbsp;
          <span>{likes}</span>
        </div>
        <span>{dateString}</span>
      </div>

      <div className='imagePostTextBottomRow'>{caption}</div>

    </div>
  )
};

export default ImagePostText;