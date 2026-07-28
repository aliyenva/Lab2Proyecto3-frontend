package com.cenfotec.crud.dto;

import com.cenfotec.crud.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String username;
    private String role;

    public static UserResponse fromUser(User user) {
        return new UserResponse(user.getUsername(), user.getRole().getName());
    }
}
