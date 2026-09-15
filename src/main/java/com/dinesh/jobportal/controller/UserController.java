package com.dinesh.jobportal.controller;

import com.dinesh.jobportal.dto.UserRequest;
import com.dinesh.jobportal.dto.UserResponse;
import com.dinesh.jobportal.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/users")
    @Tag(name = "User APIs", description = "APIs related to user management")
    @Operation(description = "Create User", summary = "APIs to create a user")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request){
        UserResponse user1 = userService.createUser(request);

        return new ResponseEntity<>(user1, HttpStatus.CREATED);
    }

    @GetMapping("/users")
    @Tag(name = "User APIs", description = "APIs related to user management")
    @Operation(description = "Get all Users", summary = "APIs to get all users")
    public ResponseEntity<List<UserResponse>> getAllUsers(){
        List<UserResponse> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/users/{id}")
    @Tag(name = "User APIs", description = "APIs related to user management")
    @Operation(description = "Get User By Id", summary = "APIs to get user by id")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id){
        UserResponse user = userService.getUserById(id);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("/users/{id}")
    @Tag(name = "User APIs", description = "APIs related to user management")
    @Operation(description = "Update User", summary = "APIs to update the user")
    public ResponseEntity<UserResponse> updateUsers(@RequestBody UserRequest request,
                                            @PathVariable Long id){
        UserResponse user1 = userService.updateUser(request, id);
        return new ResponseEntity<>(user1, HttpStatus.OK);
    }

    @DeleteMapping("/users/{id}")
    @Tag(name = "User APIs", description = "APIs related to user management")
    @Operation(description = "Delete User", summary = "APIs to delete the user")
    public ResponseEntity<String> deleteUser(@PathVariable Long id){
         userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully!");
    }

}
