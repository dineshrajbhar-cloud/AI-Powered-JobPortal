package com.dinesh.jobportal.serviceImpl;

import com.dinesh.jobportal.authenticationDTO.JwtResponse;
import com.dinesh.jobportal.authenticationDTO.LoginRequest;
import com.dinesh.jobportal.authenticationDTO.SignupRequest;
import com.dinesh.jobportal.entity.Role;
import com.dinesh.jobportal.entity.User;
import com.dinesh.jobportal.exception.DuplicateResourceException;
import com.dinesh.jobportal.repositories.UserRepository;
import com.dinesh.jobportal.security.services.jwt.JwtUtils;
import com.dinesh.jobportal.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JwtUtils jwtUtils;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public String register(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CANDIDATE);

        userRepository.save(user);

        return "User Registered successfully!";
    }

    @Override
    public JwtResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        String token = jwtUtils.generateToken(user.getEmail());

        return new JwtResponse(
                token,
                user.getName(),
                user.getEmail()
        );
    }
}
