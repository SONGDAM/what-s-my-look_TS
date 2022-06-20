import unLike from '../assets/icon/empty-heart.png';
import like from '../assets/icon/full-heart.png';
import '../styles/like.css';
import { useState, useEffect } from 'react';
import { update, ref, onValue, push, child, remove } from 'firebase/database';
import { useRecoilValue } from 'recoil';
import { authState } from '../recoil/authState';
import { database } from './firebase';

function Like({ imageDummy }) {
  const [isLike, setisLike] = useState(false);
  const [viewNumber, setViewNumber] = useState([]);

  const imageIndex = imageDummy.id - 1;
  const authUser = useRecoilValue(authState);
  const getLikesUserReference = ref(
    database,
    `database/look/${imageIndex}/likes`
  );
  const getCountReference = ref(database, `database/look/${imageIndex}`);

  useEffect(() => {
    const res = async () => {
      fetch(
        `https://what-s-my-look-default-rtdb.firebaseio.com/database/look/${imageIndex}.json`
      )
        .then((response) => response.json())
        .then((data) => setViewNumber(data));
    };
    res();
  }, [imageIndex, isLike]);

  //페이지 로딩 시 유저가 좋아요 했으면 빨간 하트
  useEffect(() => {
    onValue(getLikesUserReference, (snapshot) => {
      if (snapshot.exists()) {
        const user = Object.values(snapshot.val()); //유저이메일
        //로그인했을 때 이미지별 좋아요 눌린 유저중에 로그인 유저랑 같은 사람이 있는지
        if (authUser) {
          if (user.filter((item) => item.user === authUser.email)[0]) {
            setisLike(true);
          }
        }
      }
    });
  }, [getLikesUserReference, authUser, imageIndex]);

  //좋아요 클릭 시
  const toggleLike = () => {
    if (!authUser) {
      alert('로그인 후 이용 가능합니다.');
      return;
    }

    if (isLike) {
      downLike();
      return;
    }
    upLike();
  };

  //좋아요
  const upLike = () => {
    setisLike(true);
    console.log('업');

    //카운트+1
    update(getCountReference, {
      count: viewNumber.count + 1,
    });

    //likes안에 저장될 고유키 생성
    const newLikeKey = push(child(ref(database), `likes`)).key;

    //저장할 값 ( 이메일 , 고유키)
    const likeData = {
      user: authUser.email,
      uuid: newLikeKey,
    };

    //유저 저장
    const updates = {};
    updates[`/database/look/${imageIndex}/likes/` + newLikeKey] = likeData;
    update(ref(database), updates);
  };

  //좋아요 취소
  const downLike = () => {
    setisLike(false);
    console.log('다운');

    //카운트-1
    update(getCountReference, {
      count: viewNumber.count - 1,
    });

    //유저제거
    if (viewNumber.likes) {
      const toArray = Object.values(viewNumber.likes);
      const userFilter = toArray.filter((item) => item.user === authUser.email);
      const likesUuid = userFilter[0].uuid;
      // console.log('좋아요 취소 키', likesUuid);

      const removeUserReference = ref(
        database,
        `database/look/${imageIndex}/likes/${likesUuid}`
      );

      remove(removeUserReference);
    }
  };

  return (
    <>
      <div className='like-container'>
        <button onClick={toggleLike}>
          <img src={isLike ? like : unLike} alt='' className='icon like' />
        </button>
        {viewNumber.count}
      </div>
    </>
  );
}

export default Like;
