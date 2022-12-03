import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
    StyleSheet,
    View,
    Text,
    Alert,
    Image,
    ScrollView,
    TouchableOpacity,
    Button,
    PermissionsAndroid,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import MapMarker from './MapMarker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_URL } from '@env';
import BackgroundService from 'react-native-background-actions';
import { useUserContext } from '../contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state',]);

const options = {
    taskName: '위치',
    taskTitle: '위치 전송기',
    taskDesc: '내 위치를 주기적으로 파트너에게 알려주는 중...',
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'Intime://',
    parameters: {
        delay: 12000,
        //1000 for test, 3000 for real service
        //delay : 3000, 
    },
};

const ScheduleandMap = route => {
    console.log('back', BackgroundService.isRunning());
    const sid = route.route.params.ID;
    const initdate = route.route.params.startTime;
    const enddate = route.route.params.endTime;
    // console.log('s_id', sid)
    // console.log(initdate, enddate)
    const navigation = useNavigation();
    const { user, setUser } = useUserContext();
    const [location, setLocation] = useState(false); //do not modify this value
    const [myid, setmyid] = useState([]);

    const [position, setPosition] = useState({
        latitude: 37.266833,
        longitude: 127.000019,
    });

    const [senddata, setsenddata] = useState([]);


    const [markerlist, setmarkerlist] = useState([]);
    const [userlist, setuserlist] = useState([]);

    const checkGroup = async () => {
        try {
            const res = await axios.get(
                `${API_URL}/api/schedulePools=${sid}/joined-members`,
                {
                    headers: { Authorization: user },
                },
            );
            setuserlist(res.data);
        } catch (e) {
            console.log(`[SCHEDULEPOOL_ERROR]${e}`);
        }
    };

    // const test = async () => {
    //     try {
    //         const res = await axios.get(`${API_URL}/api/schedulePools=${sid}/joined-members`,
    //             {
    //                 headers: { Authorization: user },
    //             },
    //         );
    //         console.log('최신', res.data)
    //     } catch (e) {
    //         console.log(`[SCHEDULEPOOL_ERROR]${e}`);
    //     }
    // };


    const getmyid = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/my-info`, {
                headers: {
                    Authorization: user,
                },
            });
            // console.log(res.data);
            setmyid(res.data.id);
        } catch (error) {
            console.log(error);
        }
    };

    const initfunction = () => {
        checkGroup();
        getmyid();
        getgroupLocation();
    }

    useEffect(() => {
        initfunction();
        if (!BackgroundService.isRunning()) {
            // backgroundHandler();
            console.log("??????")
        }
    }, []);

    const sleep = time =>
        new Promise(resolve => setTimeout(() => resolve(), time));

    const backgroundHandler = async () => {
        console.log('hi');
        await BackgroundService.start(backpostservice, options);
    };

    const backpostservice = async taskDataArguments => {
        const { delay } = taskDataArguments;
        await new Promise(async resolve => {
            for (let i = 0; BackgroundService.isRunning(); i++) {
                console.log(i);
                if (i % 5 === 0) {
                    console.log('Hello locationapi!');
                    console.log('position', position);
                    setTimeout(() => {
                        getLocation();
                    }, 100);

                }

                if (enddate <= new Date()) {
                    console.log('Bye~time is over');
                    await BackgroundService.stop();
                }
                if (i === 50) {
                    // Alert.alert('오류', '관리자에게 문의하세요 errorcode timeout_at_backgroundservice')
                    console.log('time out')
                    await BackgroundService.stop();
                }
                await sleep(delay);
            }
        });
    };

    const stopHandler = async () => {
        await BackgroundService.stop();
    };

    const grouplocationpost = async (latlng) => {
        console.log('my location 잘 나오냐3', latlng);
        try {
            const res = await axios.post(
                `${API_URL}/api/${sid}/location`,
                {
                    gps_x: latlng.latitude,
                    gps_y: latlng.longitude,
                    id: myid,
                },
                {
                    headers: {
                        Authorization: user,
                    },
                },
            );

            console.log('my location 잘 나오냐4', latlng);
            console.log(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const mylocationpost = async (latlng) => {

        console.log('my location 잘 나오냐1', latlng);
        if (latlng) {
            try {
                const res = await axios.post(
                    `${API_URL}/api/location`,
                    {
                        gps_x: latlng.latitude,
                        gps_y: latlng.longitude,
                    },
                    {
                        headers: {
                            Authorization: user,
                        },
                    },
                );
                console.log('my location 잘 나오냐2', latlng);
                grouplocationpost(latlng)
            } catch (err) {
                console.error(err);
            }
        }

    };

    const getLocationfromapi = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/location`, {
                headers: {
                    Authorization: user,
                },
            });
            console.log(res.data);
            if (res.data) {
                setPosition({
                    latitude: parseFloat(res.data.gps_x),
                    longitude: parseFloat(res.data.gps_y),
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getgroupLocation = async () => {
        setmarkerlist([]);
        console.log("값 날려라", markerlist)
        try {
            const res = await axios.get(`${API_URL}/api/${sid}/locations`,
                {
                    headers: {
                        Authorization: user,
                    },
                });
            console.log('res data from get group location', res.data);

            // const newList = res.data;
            // const newArray = markerlist.map(
            //     (userObj) => userObj.id === newList.map(user => user.useridx) ? { ...userObj, gps_x: newList.gps_x, gps_y: newList.gps_y } : userObj);
            // console.log('newList', newList)

            // console.log('나는 새로운 배열이다 뭐가 나올까? ', newArray);
            setmarkerlist(res.data);
            // setmarkerlist(newList);
            console.log('markerlist', markerlist)
        } catch (err) {
            console.error(err);
        }
    };

    const requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Geolocation Permission',
                    message: 'Can we access your location?',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            console.log('granted', granted);
            if (granted === 'granted') {
                console.log('You can use Geolocation');
                return true;
            } else {
                console.log('You cannot use Geolocation');
                return false;
            }
        } catch (err) {
            return false;
        }
    };

    const getLocation = () => {
        const result = requestLocationPermission();
        result.then(res => {
            console.log('res is:', res);
            if (res) {
                Geolocation.getCurrentPosition(
                    position => {
                        console.log('position 123 123', position);
                        setLocation(position);
                        // console.log(location)
                        // 화면 중심부 변환
                        // setPosition({
                        //     latitude: position.coords.latitude,
                        //     longitude: position.coords.longitude,
                        // });
                        // setsenddata({
                        //     latitude: position.coords.latitude,
                        //     longitude: position.coords.longitude,
                        // });
                        mylocationpost(position.coords)
                        // console.log('getlocation 직후 데이터', senddata)
                    },
                    error => {
                        console.log(error.code, error.message);
                        setLocation(false);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
                );
            }
            console.log('senddata', senddata)
        });
    };

    const pressuserlog = param => {
        console.log(param.id, '의 위치 표시하기');
        getgroupLocation();
        console.log('개인화면에서 마커 리스트', markerlist)
        console.log('')
        const mainview = markerlist.filter(marker => marker.useridx === param.id);
        if (mainview[0]) {
            setPosition({
                latitude: parseFloat(mainview[0].gps_x),
                longitude: parseFloat(mainview[0].gps_y),
            });
        }
    };

    return (
        <>
            <View>

                {/* <Button title="뒤로가기" onPress={() => navigation.pop()} /> */}
                <View style={styles.userlistwrapper}>
                    {userlist.length > 0 ? (
                        <View>
                            <ScrollView horizontal={true}>
                                {userlist.map(user => (
                                    <View key={user.id}>
                                        <View>
                                            <TouchableOpacity
                                                onPress={() => pressuserlog(user)}>
                                                <Text style={styles.textlist}>{user.email}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.textlist}>친구 없는 경우</Text>
                        </View>
                    )}
                </View>
            </View>
            <View>
                {/* 아래 버튼은 자동화 구현 후 삭제 예정 */}
                <Button title="backgroundHandler" onPress={backgroundHandler}></Button>
                <Button title="stopHandler" onPress={stopHandler}></Button>
            </View>
            <View style={{ flex: 9 }}>
                <View style={{ flex: 1, padding: 10 }}>
                    <MapView
                        style={{ flex: 1 }}
                        provider={PROVIDER_GOOGLE}
                        region={{
                            latitude: position.latitude,
                            longitude: position.longitude,
                            latitudeDelta: 0.04,
                            longitudeDelta: 0.04,
                        }}>
                        {/* <Marker
                            id="0"
                            title={'내 위치'}
                            pinColor="red"
                            coordinate={{
                                latitude: position.latitude,
                                longitude: position.longitude,
                            }}>
                            <Image
                                style={{ width: 26, height: 28 }}
                                source={require('../img04.gif')}
                            />
                        </Marker> */}

                        {markerlist.map(marker => (
                            <Marker
                                key={marker.useridx}
                                title={marker.username}
                                coordinate={{
                                    latitude: parseFloat(marker.gps_x),
                                    longitude: parseFloat(marker.gps_y),
                                }}
                            >
                                <Image
                                    style={{ width: 26, height: 28 }}
                                    source={require('../img04.gif')}
                                />
                            </Marker>
                        ))}
                    </MapView>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    userlistwrapper: {
        borderRadius: 10,
        borderColor: 'pink',
        borderWidth: 3,
        justifyContent: 'flex-start',
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 10,
        margin: 1,
    },
    textlist: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 24,
        paddingHorizontal: 10,
    },
});

export default ScheduleandMap;
