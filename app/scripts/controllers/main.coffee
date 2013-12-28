'use strict'

angular.module('xoWebApp')
  .controller 'MainCtrl', ($scope, xoApi, xoObjects) ->
    VMs = []
    $scope.$watch(
      -> xoObjects.revision
      (revision) ->
        return if revision is 0

        {byTypes} = xoObjects

        $scope.xo = byTypes.xo[0]

        $scope.pools = byTypes.pool
        $scope.hosts = byTypes.host

        VMs = $scope.VMs = byTypes.VM
    )

    $scope.rebootHost = (UUID) ->
      console.log "Reboot Host #{UUID}"

      # TODO

    $scope.shutdownHost = (UUID) ->
      console.log "Shutdown Host #{UUID}"

      # TODO

    $scope.restart_toolstackHost = (UUID) ->
      console.log "Restart Toolstack for Host #{UUID}"

      # TODO

    $scope.pool_removeHost = (UUID) ->
      console.log "Remove Host #{UUID} from its current pool"

      # TODO

    $scope.startVM = (UUID) ->
      console.log "Start VM #{UUID}"

      xoApi.call 'xapi.vm.start', {id: UUID}

    $scope.start_onVM = (UUID) ->
      console.log "Start VM #{UUID} on Host #{Host.UUID}"

      # TODO

    $scope.stopVM = (UUID) ->
      console.log "Stop VM #{UUID}"

      xoApi.call 'xapi.vm.shutdown', {id: UUID}

    $scope.force_stopVM = (UUID) ->
      console.log "Force Stop VM #{UUID}"

      xoApi.call 'xapi.vm.hard_shutdown', {id: UUID}

    $scope.rebootVM = (UUID) ->
      console.log "Reboot VM #{UUID}"

      xoApi.call 'xapi.vm.reboot', {id: UUID}

    $scope.force_rebootVM = (UUID) ->
      console.log "Reboot VM #{UUID}"

      xoApi.call 'xapi.vm.hard_reboot', {id: UUID}

      # TODO

    # VMs checkboxes.
    do ->
      # This map marks which VMs are selected.
      selected_VMs = $scope.selected_VMs = {}

      # Number of selected VMs.
      $scope.n_selected_VMs = 0

      # This is the master checkbox.
      # Three states: true/false/null
      $scope.master_selection = false

      # Wheter all VMs are selected.
      $scope.all = false

      # Whether no VMs are selected.
      $scope.none = true

      # Updates `all`, `none` and `master_selection` when necessary.
      $scope.$watch 'n_selected_VMs', (n) ->
        $scope.all = (VMs.length is n)
        $scope.none = (n is 0)

        # When the master checkbox is clicked from indeterminate
        # state, it should go to unchecked like Gmail.
        $scope.master_selection = (n isnt 0)

      make_matcher = (sieve) ->
        (item) ->
          for key, val of sieve
            return false unless item[key] is val
          true

      $scope.selectVMs = (sieve) ->
        if (sieve is true) or (sieve is false)
          $scope.n_selected_VMs = if sieve then VMs.length else 0
          selected_VMs[VM.UUID] = sieve for VM in VMs
          return

        n = 0

        matcher = make_matcher sieve
        ++n for VM in VMs when (selected_VMs[VM.UUID] = matcher VM)

        $scope.n_selected_VMs = n

      $scope.updateVMSelection = (UUID) ->
        if selected_VMs[UUID]
          ++$scope.n_selected_VMs
        else
          --$scope.n_selected_VMs
