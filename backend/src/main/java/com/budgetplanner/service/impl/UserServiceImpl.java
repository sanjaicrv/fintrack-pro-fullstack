package com.budgetplanner.service.impl;

import com.budgetplanner.dto.request.UserUpdateRequest;
import com.budgetplanner.dto.response.UserResponse;
import com.budgetplanner.entity.User;
import com.budgetplanner.exception.ResourceNotFoundException;
import com.budgetplanner.mapper.UserMapper;
import com.budgetplanner.repository.UserRepository;
import com.budgetplanner.service.UserService;
import com.budgetplanner.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        User user = SecurityUtils.getCurrentUser();
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(UserUpdateRequest request) {
        User user = SecurityUtils.getCurrentUser();
        log.info("Updating profile for user id: {}", user.getId());

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setTheme(request.getTheme());

        user = userRepository.save(user);
        log.info("User profile updated for id: {}", user.getId());
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse toggleTheme() {
        User user = SecurityUtils.getCurrentUser();
        log.info("Toggling theme for user id: {}", user.getId());

        User.Theme newTheme = user.getTheme() == User.Theme.LIGHT
                ? User.Theme.DARK
                : User.Theme.LIGHT;
        user.setTheme(newTheme);

        user = userRepository.save(user);
        log.info("Theme toggled to: {} for user id: {}", newTheme, user.getId());
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
