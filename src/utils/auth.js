import store from '../store'
import Cookies from 'js-cookie'

const sessionToken = "_$session$token$_";
const cookieToken = "NEW_TOKEN";

export function getToken() {
    let token = window.sessionStorage.getItem(sessionToken);
    if (typeof token == "undefined" || token == null) {
        token = Cookies.get(cookieToken);
    }
    return token;
}

export function setToken(token) {
    window.sessionStorage.setItem(sessionToken, token);
    Cookies.set(cookieToken, token);
}

export function removeToken() {
    window.sessionStorage.removeItem(sessionToken)
    Cookies.remove(cookieToken);
}

export function hasModule(module) {
    if (module) {
        if (store.getters.roles &&
            store.getters.roles.length > 0) {
            for (let i = 0; i < store.getters.roles.length; i++) {
                if (store.getters.roles[i].toLowerCase() == module.toLowerCase()) {
                    return true;
                }
            }
        }
    }
    return false;
}
