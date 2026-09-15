package com.dinesh.jobportal.controller;

import com.dinesh.jobportal.authenticationDTO.JwtResponse;
import com.dinesh.jobportal.authenticationDTO.LoginRequest;
import com.dinesh.jobportal.authenticationDTO.SignupRequest;
import com.dinesh.jobportal.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {


    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    @Tag(name = "Authentication APIs", description = "APIs for user registration and login")
    @Operation(description = "User Sign-up", summary = "APIs to signup users")
    public ResponseEntity<String> register(@RequestBody SignupRequest request){

        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Tag(name = "Authentication APIs", description = "APIs for user registration and login")
    @Operation(description = "User Long-in", summary = "APIs to login users")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request){

        return ResponseEntity.ok(authService.login(request));
    }

}
