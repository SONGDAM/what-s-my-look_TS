import { useRecoilValue } from 'recoil';
import '../styles/Look.css';
import NavBar from '../components/NavBar';
import Like from '../components/Like';
import { authState } from '../recoil/authState';
import _ from 'lodash';
import { IimageDataProperty } from '../types/IimageDataProperty';
import { useEffect } from 'react';
import { saveUserFirebase } from '../components/saveFirebase';
import { useLocation } from 'react-router-dom';

function Liked(): JSX.Element {
  const getLikedImagesState = localStorage.getItem('likedImages');
  const likedImages: IimageDataProperty[] = JSON.parse(
    getLikedImagesState || '[]'
  ); //로그인 좋아요

  const getUnAuthedLikeImage = sessionStorage.getItem('nonLoginLikedImages');
  const unAuthedLikeImage = JSON.parse(getUnAuthedLikeImage || '[]'); //비로그인 좋아요
  const authUser = useRecoilValue(authState);
  const location = useLocation();

  useEffect(() => {
    //비로그인 좋아요
    if (unAuthedLikeImage.length > 0 && authUser) {
      //비로그인 좋아요 사진 O & 로그인 좋아요 사진 X
      if (likedImages.length === 0) {
        //세션 -> 로컬 저장
        localStorage.setItem(
          'likedImages',
          JSON.stringify(_.uniqBy(unAuthedLikeImage, 'id'))
        );

        //파이어베이스 저장
        unAuthedLikeImage.map((images: IimageDataProperty) =>
          saveUserFirebase(images, authUser.email)
        );

        //로컬로 옮기고 비로그인 세션 삭제
        sessionStorage.removeItem('nonLoginLikedImages');
        return;
      }

      //비로그인 좋아요 사진 O & 로그인 좋아요 사진 O
      if (likedImages.length > 0) {
        //비로그인 + 로그인 사진 합칠 배열 생성
        let mergeLikedImages: IimageDataProperty[] = [];
        mergeLikedImages = [...likedImages];

        //로그인배열에 비로그인배열 추가
        Object.keys(unAuthedLikeImage).map((key) => {
          mergeLikedImages.push(unAuthedLikeImage[key]);
        });

        //로컬에 추가
        localStorage.setItem(
          'likedImages',
          JSON.stringify(_.uniqBy(mergeLikedImages, 'id'))
        );

        const mergeLikeImagesNumberKey = Object.keys(mergeLikedImages).map(
          (key) => parseInt(key)
        );

        //파이어베이스 저장
        mergeLikeImagesNumberKey.map((key) =>
          saveUserFirebase(mergeLikedImages[key], authUser.email)
        );

        //로컬로 옮기고 비로그인 세션 삭제
        sessionStorage.removeItem('nonLoginLikedImages');
      }
    }
  }, [authUser, likedImages, unAuthedLikeImage, , location]);

  return (
    <>
      <NavBar />
      <div className='card likedPage'>
        {likedImages.length > 0 ? (
          Object.values(likedImages).map((item, idx) => (
            <div key={idx}>
              <img src={item.src} key={item.id} className='image' />
              <div className='icon-wrapper'>
                <Like images={item} />
              </div>
            </div>
          ))
        ) : (
          <div>이미지에 좋아요를 눌러보세요</div>
        )}
      </div>
    </>
  );
}

export default Liked;
