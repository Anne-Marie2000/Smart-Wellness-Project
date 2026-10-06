package com.smartwellness.api.auth;

import org.mindrot.jbcrypt.BCrypt;

/*
 * Small helper class for hashing and checking passwords.
 * We never store a user's actual password anywhere, just this hash.
 */
public class PasswordUtil {

    public static String hash(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(10));
    }

    public static boolean verify(String plainPassword, String hashedPassword) {
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }
}
