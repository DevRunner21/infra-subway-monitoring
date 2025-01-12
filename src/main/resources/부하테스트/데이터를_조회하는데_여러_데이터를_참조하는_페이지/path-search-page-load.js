/**
 * 테스트 목적 = 평균 VUser ~ 최대 VUser (피크 타임의 10배)까지 부하를 늘리면서 서버 상태를 체크한다.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://devrunner21.kro.kr/';
const AVG_VUSER = 2;
const MAX_VUSER = 22;

export let options = {
    stages: [
        { duration: '5m', target: AVG_VUSER }, // 5분 동안 평균 VUser로 늘어난다.
        { duration: '5m', target: AVG_VUSER }, // 5분 동안 평균 VUser를 유지한다.
        { duration: '10m', target: MAX_VUSER }, // 10분동안 서서히 MAX VUSer수로 늘린다.
        { duration: '10m', target: MAX_VUSER }, // 10분동안 MAX VUSer를 유지한다.
        { duration: '10m', target: 0 }, // 10분동안 서서히 0으로 줄어든다.
    ],
    thresholds: {
        http_req_duration: ['p(99)<200'], // 왕복 200ms(latency를 100ms 로 세팅)
        'logged in successfully': ['p(99)<200'],
    },
};

export default function () {

    var params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // 역 목록 조회
    let getStationsRes = http.get(`${BASE_URL}/stations`, params);
    check(getStationsRes, {
        'get stations request successful': (resp) => resp.status == 200,
    });

    // 경로 검색
    let searchPathsRes = http.get(`${BASE_URL}/paths?source=84&target=105`, params);
    check(searchPathsRes, {
        'search paths is successful': (resp) => resp.status == 200,
    });

    sleep(1);

};
