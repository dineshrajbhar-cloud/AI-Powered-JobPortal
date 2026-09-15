package com.dinesh.jobportal.serviceImpl;

import com.dinesh.jobportal.dto.UserRequest;
import com.dinesh.jobportal.dto.UserResponse;
import com.dinesh.jobportal.entity.User;
import com.dinesh.jobportal.exception.DuplicateResourceException;
import com.dinesh.jobportal.exception.ResourceNotFoundException;
import com.dinesh.jobportal.repositories.UserRepository;
import com.dinesh.jobportal.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponse createUser(UserRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);

//        UserResponse userResponse = new UserResponse();
//
//        userResponse.setId(savedUser.getId());
//        userResponse.setName(savedUser.getName());
//        userResponse.setEmail(savedUser.getEmail());
//        userResponse.setRole(savedUser.getRole());

        return toResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {

       List<User> users = userRepository.findAll();

        return users.stream()
                .map(user -> {
                    UserResponse response = new UserResponse();
                    response.setId(user.getId());
                    response.setName(user.getName());
                    response.setEmail(user.getEmail());
                    response.setRole(user.getRole());

                    return response;
                }).toList();
    }

    @Override
    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("User not found with id: "+id));

        UserResponse userResponse = new UserResponse();

        userResponse.setId(user.getId());
        userResponse.setName(user.getName());
        userResponse.setEmail(user.getEmail());
        userResponse.setRole(user.getRole());

        return userResponse;
    }

    @Override
    public UserResponse updateUser(UserRequest request, Long id) {

        Optional<User> existUser = userRepository.findByEmail(request.getEmail());

        if(existUser.isPresent() && !existUser.get().getId().equals(id)){
            throw new DuplicateResourceException("Email already exists!");
        }

        User user = userRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("User not found with id: "+id));

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User updatedUser = userRepository.save(user);

//        UserResponse userResponse = new UserResponse();
//
//        userResponse.setId(updatedUser.getId());
//        userResponse.setName(updatedUser.getName());
//        userResponse.setEmail(updatedUser.getEmail());
//        userResponse.setRole(updatedUser.getRole());

        return toResponse(updatedUser);
    }

    private UserResponse toResponse(User user) {
        UserResponse r = new UserResponse();
        r.setId(user.getId());
        r.setName(user.getName());
        r.setEmail(user.getEmail());
        r.setRole(user.getRole());
        return r;
    }

    @Override
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                new ResourceNotFoundException("User not found with id: "+id));

        userRepository.deleteById(id);
    }
}
