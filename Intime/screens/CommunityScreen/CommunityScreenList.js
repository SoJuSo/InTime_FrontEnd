import React from 'react';
import { StyleSheet, ScrollView, View, Text, Button } from 'react-native';

function CommunityScreenList(props) {
    const { userList } = props;
    console.log(userList)
    return (
        <View
            style={{
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '80%',
            }}>
            {userList.length === 0 ? <Text style={{ color: 'black' }}>등록된 친구가 없습니다.</Text> :
                userList.map(user => <View style={styles.list} key={user}><Text style={styles.titleText}>{user}</Text></View>)
            }

        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        justifyContent: 'space-around',
        width: '85%',
        height: 50,
        background: 'white',
        borderColor: '#ED3648',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 10,
    },
    titleText: {
        marginLeft: 10,
        fontSize: 30,
        fontWeight: "bold",
    },
});

export default CommunityScreenList;
