import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Button, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { useUserContext } from '../../contexts/UserContext';


function CommunityScreenRequestList() {
    const { user } = useUserContext();
    const [list, setList] = useState([])
    const getList = async () => {
        //통신 요청 리스트 가져옴
        try {
            const res = await axios.get(
                `${API_URL}/friends/request`,
                {
                    headers: { Authorization: user, },
                },
            );
            setList(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    const addPush = async (userId) => {
        try {
            const res = await axios.put(`${API_URL}/friends/request/${userId}`,
                {
                    body: null
                },
                {
                    headers: { Authorization: user, },
                }
            );
            Alert.alert('수락 완료', '친구 목록이 추가되었어요.')
            console.log('userid', userId);
            //요기서
        } catch (err) {
            Alert.alert('에러!', '에러가 발생 했어요.')
            console.err(err);
            console.log('userid', userId);
        }
    }
    const refusePush = async (userId) => {
        try {
            const res = await axios.delete(`${API_URL}/friends/request/${userId}`,
                {
                    headers: { Authorization: user, },
                }
            );
            Alert.alert('거절 완료', '거절되었어요.')
            console.log('userid', userId);
        } catch (err) {
            Alert.alert('에러!', '에러가 발생 했어요.')
            console.err(err);
            console.log('userid', userId);
        }
    }

    useEffect(() => {
        getList();
    }, [])

    console.log(list)
    return (
        <View>
            {list.length > 0 ?
                <View>{list.map(user => <View key={user.id}>
                    <View>
                        <ScrollView>
                            <View style={styles.requestList}>
                                <Text style={styles.listText}>{user.username}</Text>
                                <View style={{
                                    justifyContent: 'flex-end',
                                    display: 'flex',
                                    flexDirection: 'row',
                                }}>
                                    <View style={{ marginHorizontal: 3, marginVertical: 5, }}>
                                        <Button color='pink' title="수락" onPress={() => {
                                            addPush(user.id);
                                            console.log('is Run?')
                                            getList();
                                        }} />
                                    </View>
                                    <View style={{ margin: 5 }}>
                                        <Button color='pink' title="거절" onPress={() => {
                                            refusePush(user.id);
                                            console.log('is Run?')
                                            getList();
                                            //되다 말다가 함
                                        }} />
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>)}

                </View> :
                <View style={{ marginTop: '50%', alignItems: 'center' }}>
                    <Text style={{ color: "gray", fontSize: 20, fontWeight: 'bold' }}>
                        받은 요청이 없습니다.
                    </Text>
                </View>}
            {/* <View style={{
                marginTop: '50%',
                justifyContent: 'flex-end',
                display: 'flex',
                flexDirection: 'column',
            }}>
            </View> */}
            <View>
                <Button title="새로고침" onPress={getList}></Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    requestList: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: '#ff5c5c',
        borderWidth: 1,
        borderRadius: 7,
        marginHorizontal: 7,
        marginVertical: 4,
    },
    iconButton: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    addList: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 6,
        borderWidth: 1,
        margin: 2,
    },
    listText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
});

export default CommunityScreenRequestList;