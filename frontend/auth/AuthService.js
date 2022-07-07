import {api} from '../api';

let authData;

// all the functions return promises as we need to
// fetch details from the server first

export default {
    getAuthData(renew = false) {
        if (!authData || renew) {
            authData = fetch(api('me'), {
                credentials: 'include',
            }).then((response) => response.json());
        }

        return new Promise((resolve, reject) => {
            authData.then(res => {
                resolve(res);
                return res;
            }, reject);
        });
    },

    isLoggedIn() {
        return new Promise((resolve, reject) => {
            this.getAuthData().then(res => resolve(res.logged_in), reject);
        });
    },

    hasRole(role) {
        // TODO: check for actual role, not 'all'
        return new Promise((resolve, reject) => {
            this.getAuthData().then(res => resolve(res.user_roles.indexOf('all') != -1), reject);
        });
    },

    getUser() {
        return new Promise((resolve, reject) => {
            this.getAuthData().then(res => resolve(res.user), reject);
        });
    },

    getCsrfToken() {
        return new Promise((resolve, reject) => {
            this.getAuthData().then(res => resolve(res.csrf_token), reject);
        });
    },

    isDevPage() {
        return new Promise((resolve, reject) => {
            this.getAuthData().then(res => resolve(res.is_dev), reject);
        });
    },

    isDibsTest() {
        return new Promise((resolve, reject) => {
            this.getAuthData().then(res => resolve(res.is_dibs_test), reject);
        });
    },
}
